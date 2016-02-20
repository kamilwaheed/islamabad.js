'use strict';

const EmailTemplate = require('email-templates').EmailTemplate;
const BPromise = require('bluebird');
const debug = require('debug')('email-templates-render');
const path = require('path');
const fs = require('fs');
const data = require('./data');

const outputDir = path.join( __dirname, './build' );

function renderTemplates(done) {
  const templateDir = path.join(__dirname, 'templates');
  const templates = getTemplatesList(templateDir);
  const templatesWithDir = templates.map(t => path.join(templateDir, t));

  debug('about to render templates...');

  BPromise.all(templatesWithDir.map(
    t => renderTemplate(t).then(saveTemplate)
  )).then(done);
}

function renderTemplate(templateDir) {
  debug(`rendering template ${templateDir}`);

  const template = new EmailTemplate(templateDir, {
    juiceOptions: {
      preserveMediaQueries: true,
      removeStyleTags: true
    }
  });

  const render = BPromise.promisify(template.render, { context: template });

  debug('rendering email templates with', data);

  return template.render(data).then(result => ({
    html: result.html,
    text: result.text,
    name: path.basename(templateDir)
  }));
}

function saveTemplate(renderedTemplate) {
  debug(`saving template ${renderedTemplate.name}`);

  const writeFile = BPromise.promisify(fs.writeFile, { context: fs });
  return BPromise.all([
    writeFile(path.join(outputDir, `${renderedTemplate.name}.html`), renderedTemplate.html),
    writeFile(path.join(outputDir, `${renderedTemplate.name}.txt`), renderedTemplate.text)
  ]);
}

function getTemplatesList(templateDir) {
  try {
    const files = fs.readdirSync(templateDir);

    debug(`found templates: ${files}`);

    return files;
  } catch (e) {
    throw new Error('couldn\'t read the templates dir');
  }
}

renderTemplates(() => debug('templates have been rendered!'));
