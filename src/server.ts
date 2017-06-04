import 'reflect-metadata';
import 'zone.js/dist/zone-node';
import { renderModuleFactory } from '@angular/platform-server'
import { enableProdMode } from '@angular/core'
import { AppServerModuleNgFactory } from '../dist/ngfactory/src/app/app.server.module.ngfactory'
import * as express from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

import { ROUTES } from './routes';
const PORT = process.env.PORT || 4000;
const cacheDuration = 60*60*24*7;


enableProdMode();

const app = express();
const compression = require('compression');
const mcache = require('memory-cache');
const https = require('https');

app.use(compression());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

let template = readFileSync(join(__dirname, '..', 'dist', 'index.html')).toString();

app.engine('html', (_, options, callback) => {
  const opts = { document: template, url: options.req.url };

  renderModuleFactory(AppServerModuleNgFactory, opts)
    .then(html => callback(null, html));
});

app.set('view engine', 'html');
app.set('views', 'src');

app.use('/', express.static('dist', {index: false}));

var cache = (duration) => {
  console.log('Testing if var cache gets hit');
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url
    console.log(key);
    let cachedBody = mcache.get(key)
    if (cachedBody) {
      console.log('There is a cachedBody')
      res.send(cachedBody)
      return
    } else {
      console.log('There is not a cachedBody')
      res.sendResponse = res.send
      // console.log('This is the res.sendResponse' + res.sendResponse);
      res.send = (body) => {
        console.log('This is the body')
        console.log(body)
        mcache.put(key, body, duration *1000);
        res.sendResponse(body)
      }
      next()
    }
  }
}

app.get('/api', cache(cacheDuration), function(req, res) {
  setTimeout(() => {
    res.json({
      exchanges: mcache.get('exchanges')
    });
  }, 3000)
})

// app.get('/exchange/NYSE', cache(cacheDuration), function(req, res) {
//   console.log('Testing if app.get /exchange/NV gets hit');
//   setTimeout(() => {
//     res.render('../dist/index', {
//       req: req,
//       res: res
//     });
//   }, 4000);
// })

ROUTES.forEach(route => {
  app.get(route, cache(cacheDuration), function(req, res) {
    setTimeout(() => {
      res.render('../dist/index', {
        req: req,
        res: res
      });
    }, 4000);
  })
})

app.use((req, res) => {
  res.status(404).send('') // not found
})

// Caching the JSON response //
let getExchanges = function() {
  https.get('https://stxclockapi.com/stxclock/api/exchanges.json', (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];
    
    let error;
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\n` +
                        `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error(`Invalid content-type.\n` +
                      `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.error(error.message);
      // consume response data to free up memory
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        console.log('This is the parsedData')
        console.log(parsedData);
        mcache.put('exchanges', parsedData, 1000*60*60);
      } catch (e) {
        console.error(e.message);
      }
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
  });
}

getExchanges();

setInterval(() => {
  getExchanges();
}, 1000*60*60)

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}!`);
});
