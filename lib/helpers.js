'use strict';

const handlebars = require('handlebars');

module.exports = {
  p: (text) => new handlebars.SafeString(text.replace(/\n/g, '<br>'))
};
