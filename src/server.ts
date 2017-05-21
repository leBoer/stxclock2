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

app.use(compression());

let template = readFileSync(join(__dirname, '..', 'dist', 'index.html')).toString();

app.engine('html', (_, options, callback) => {
  const opts = { document: template, url: options.req.url };

  renderModuleFactory(AppServerModuleNgFactory, opts)
    .then(html => callback(null, html));
});

app.set('view engine', 'html');
app.set('views', 'src')

app.use('/', express.static('dist', {index: false}));

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

app.get('/', cache(86400), function(req, res) {
  setTimeout(() => {
    res.render('../dist/index', {
      req: req,
      res: res
    });
    console.timeEnd(`GET: ${req.origialUrl}`);
  }, 4000);
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

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}!`);
});
