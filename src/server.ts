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

let template = readFileSync(join(__dirname, '..', 'dist', 'index.html')).toString();

app.engine('html', (_, options, callback) => {
  const opts = { document: template, url: options.req.url };

  renderModuleFactory(AppServerModuleNgFactory, opts)
    .then(html => callback(null, html));
});

app.set('view engine', 'html');
app.set('views', 'src')

app.use('/', express.static('dist', {index: false}));

// routeCache
var routeCache = require('route-cache');

// cache route for 20 seconds
app.get('/index', routeCache.cacheSeconds(20), function(req, res){
  console.log('You will only see this every 20 seconds.');
  res.send('this response will be cached');
});

ROUTES.forEach(route => {
  app.get(route, (req, res) => {
    console.time(`GET: ${req.originalUrl}`);
    res.render('../dist/index', {
      req: req,
      res: res
    });
    console.timeEnd(`GET: ${req.originalUrl}`);
    console.log('test');
  });
});

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}!`);
});
