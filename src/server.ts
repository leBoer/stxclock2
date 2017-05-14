import 'reflect-metadata';
import 'zone.js/dist/zone-node';
import { renderModuleFactory } from '@angular/platform-server'
import { enableProdMode } from '@angular/core'
import { AppServerModuleNgFactory } from '../dist/ngfactory/src/app/app.server.module.ngfactory'
import * as express from 'express';
// import * as routeCache from 'route-cache';
import { readFileSync } from 'fs';
import { join } from 'path';

import { ROUTES } from './routes';
const PORT = process.env.PORT || 4000;


enableProdMode();

const app = express();
const cache = require('route-cache');

let template = readFileSync(join(__dirname, '..', 'dist', 'index.html')).toString();

app.engine('html', (_, options, callback) => {
  const opts = { document: template, url: options.req.url };

  renderModuleFactory(AppServerModuleNgFactory, opts)
    .then(html => callback(null, html));
});

app.set('view engine', 'html');
app.set('views', 'src')

app.use('/', express.static('dist', {index: false}));

// app.get('/', cache.cacheSeconds(10), function(req, res){
//   // do your dirty work here...
//   console.log('you will only see this every 10 seconds.');
//   res.render('../dist/index', {
//     req: req,
//     res: res
//   });
//   return req.originalUrl;
//   // res.send('this response will be cached');
// });

ROUTES.forEach(route => {
  app.get(route, cache.cacheSeconds(10), function(req, res) {
    console.time(`GET: ${req.originalUrl}`);
    res.render('../dist/index', {
      req: req,
      res: res
    });
    console.timeEnd(`GET: ${req.originalUrl}`);
  });
});

// ROUTES.forEach(route => {
//   app.get(route, (req, res) => {
//     console.time(`GET: ${req.originalUrl}`);
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
