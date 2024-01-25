const { defineConfig } = require('cypress')

module.exports = defineConfig({
  env: {
    cmc_uri: '/en-US/app/splunk-3D-graph-network-topology-viz',
    splunk_user: 'admin',
    splunk_password: 'changed!',
  },
  //defaultCommandTimeout: 40000,
  //viewportWidth: 1000,
  //viewportHeight: 1200,
  //chromeWebSecurity: false,
  //screenShotOnFailure: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:8000',
    pageLoadTimeout: 600000,
    // Reference on skipping tests: 
    // https://www.browserstack.com/guide/cypress-skip-test
    // excludeSpecPattern: [
    //   "./cypress/e2e/**/login.cy.js",
    //   "./cypress/e2e/**/graph_analysis.cy.js"
    // ],
  },
  // Write test results to stdout and to xml reports
  reporter: 'junit',
  reporterOptions: {
    "mochaFile": "cypress/results/results.xml",
    "toConsole": true
  }
})
