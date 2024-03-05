/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('before:browser:launch', (browser = {}, launchOptions) => {
    // `args` is an array of all the arguments that will
    // be passed to browsers when it launches
    console.log(launchOptions.args); // print all current args
    if (browser.name == 'chrome' || browser.name == 'firefox') {
      launchOptions.args.push('--disable-gpu');
    }
    return launchOptions;
  })

  on('uncaught:exception', (err, runnable) => {
    // we expect a 3rd party library error with message 'window.locale_name is not a function'
    // and don't want to fail the test so we return false
    if (err.message.includes('window.locale_name is not a function')) {
      return false;
    }
    // we still want to ensure there are no other unexpected
    // errors, so we let them fail the test
  })
}
