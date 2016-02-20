'use strict';

const bunyan = require('bunyan');

const dev = process.env.NODE_ENV != 'production' || process.env.NODE_ENV != 'staging';

module.exports = bunyan.createLogger({
  name: 'islamabadjs',
  streams: [{
    path: dev ? './logs/islamabadjs.log' : '/var/log/islamabadjs/islamabadjs.log'
  }]
});
