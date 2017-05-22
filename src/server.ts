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


enableProdMode();

const app = express();
// const cache = require('route-cache');
const compression = require('compression');
const mcache = require('memory-cache');
// For the http get request: //
const https = require('https');

app.use(compression());

app.use('/', express.static('dist', {index: false}));
// app.set('view engine', 'jade');
let template = readFileSync(join(__dirname, '..', 'dist', 'index.html')).toString();

app.engine('html', (_, options, callback) => {
  const opts = { document: template, url: options.req.url };

  renderModuleFactory(AppServerModuleNgFactory, opts)
    .then(html => callback(null, html));
});

app.set('view engine', 'html');
app.set('views', 'src')

var cache = (duration) => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url
    let cachedBody = mcache.get(key)
    if (cachedBody) {
      console.log('There is a cachedBody')
      res.send(cachedBody)
      return
    } else {
      console.log('There is not a cachedBody')
      res.sendResponse = res.send
      res.send = (body) => {
        mcache.put(key, body, duration *1000);
        res.sendResponse(body)
      }
      next()
    }
  }
}

app.get('/', cache(60), function(req, res) {
  setTimeout(() => {
    res.render('../dist/index', {
      req: req,
      res: res
    });
    console.timeEnd(`GET: ${req.originalUrl}`);
  }, 5000);
});

app.use((req, res) => {
  res.status(404).send('') // not found
})

// ROUTES.forEach(route => {
//   app.get(route, cache.cacheSeconds(3600), function(req, res) {
//     console.time(`GET: ${req.originalUrl}`);
//     console.log('you will only see this every hour');
//     res.render('../dist/index', {
//       req: req,
//       res: res
//     });
//     console.timeEnd(`GET: ${req.originalUrl}`);
//   });
// });

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
        console.log(parsedData);
      } catch (e) {
        console.error(e.message);
      }
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
  });
  // http.get({
  //   hostname: 'stxclockapi.com',
  //   path: '/stxclock/api/exchanges.json',
  //   agent: false
  // }, (res) => {
  //   console.log(res.results);
  // });
}

setTimeout(() => {
  getExchanges();
}, 5000)

// setInterval(() => {
//   app.get('https://stxclockapi.com/stxclock/api/exchanges.json', cache(60), function(req, res) {
//     setTimeout(() => {
//       console.log(res);
//     }, 5000);
//   });

// }, 10000)

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}!`);
});
