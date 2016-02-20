'use strict';

const Mailgun = require('mailgun-es6');
const BPromise = require('bluebird');
const path = require('path');
const log = require('./log');
const debug = require('debug')('email');
const fs = BPromise.promisifyAll(require('fs'));

const privateApi = process.env.MAILGUN_API_KEY;
const domainName = process.env.MAILGUN_DOMAIN;

const mailgun = new Mailgun({ privateApi, publicApi: '', domainName });

const templatesDir = path.join( __dirname, '..', 'email', 'build' );

module.exports = {
  signup(to) {
    const html = path.join( templatesDir, 'sign-up.html' );
    const txt = path.join( templatesDir, 'sign-up.txt' );
    const subject = 'You\'re going to islamabad.js';
    const from = 'islamabad.js Team <team@isloojs.com>';
    const list = 'signups@isloojs.com';

    debug(`about to send signup email to: ${to}`);

    return BPromise.all([
      fs.readFileAsync(html),
      fs.readFileAsync(txt)
    ]).then((files) => {
      const html = files[0].toString();
      const txt = files[1].toString();

      debug('email template files retrieved');

      const data = { from, to, subject, html, txt };

      const getEmailFromList = mailgun.getMailListsMembers(list, to);
      getEmailFromList.then(body => log.info(`getMailListsMembers: ${list}, ${to}; response: ${JSON.stringify(body)}`));

      return getEmailFromList.then((body) => {
        debug(`user already exists in mailing list; assuming to have already signed up: ${to}`);
        log.info(`user already exists in mailing list; assuming to have already signed up: ${to}`);

        return { status: 'already-signed-up' };
      }).catch(() => {
        const sendEmail = mailgun.sendEmail(data);
        sendEmail.then(body => log.info(`sendEmail: ${to}; response: ${body}`));

        const addToList = mailgun.addMailListsMembers(list, [{ address: to }]);
        addToList.then(body => log.info(`addMailListMembers: ${list}, ${to}; response: ${body}`));

        return BPromise.all([ sendEmail, addToList ]).then(() => {
          debug(`signup email sent and user added to list: ${to}`);
          log.info(`signup email sent and user added to list: ${to}`);

          return { status: 'signed-up' };
        });
      });

    });
  }
};
