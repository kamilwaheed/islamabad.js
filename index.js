'use strict';

const koa = require('koa');
const handlebars = require('koa-handlebars');
const helpers = require('./lib/helpers');
const route = require('koa-route');
const bodyParser = require('koa-bodyparser');
const staticFiles = require('koa-static');
const path = require('path');
const selectn = require('selectn');
const emailValidator = require('email-validator');
const email = require('./lib/email');
const _ = require('lodash');
const BPromise = require('bluebird');
const fs = BPromise.promisifyAll(require('fs'));

const app = koa();
const data = require('./data.json');

app.use(staticFiles( path.join(__dirname, 'static') ));
app.use(bodyParser());

app.use(handlebars({
  defaultLayout: 'main',
  cache: false,
  partialsDir: path.join(__dirname, 'partials'),
  helpers
}));

app.use(route.get('/', function* () {
  const webpackStats = yield fs.readFileAsync('./webpack-stats.json');
  const scriptSrc = 'js/dist/' + JSON.parse(webpackStats.toString()).scripts[0];

  yield this.render('index', _.extend({}, data, { scriptSrc }));
}));

app.use(route.post('/signup', function* () {
  if (!selectn('body.email', this.request) || !emailValidator.validate(this.request.body.email)) {
    this.status = 400;
    this.body = { status: 'invalid-email' };
  } else {
    this.body = yield email.signup(this.request.body.email);
  }
}));

app.listen(8000);
