const { defineConfig } = require('cypress')

// Ref. https://docs.cypress.io/guides/references/configuration
module.exports = defineConfig({
  //screenShotOnFailure: false,
  e2e: {
    env: {
      cmc_uri: 'app/splunk-3D-graph-network-topology-viz',
      splunk_user: 'admin',
      splunk_password: 'changed!',
    },
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:8000/en-US/',
    defaultCommandTimeout: 40000,
    // retries: 3,
    // chromeWebSecurity: false,
    // experimentalMemoryManagement: true,
    pageLoadTimeout: 600000,
    // viewportWidth: 1000,
    // viewportHeight: 1200,
    video: true,
    videoCompression: false,
    // About skipping tests: https://www.browserstack.com/guide/cypress-skip-test
    excludeSpecPattern: [
      "./cypress/e2e/**/graph_analysis.cy.js"
    ],
  },
  // Write test results to stdout and to xml reports
  reporter: 'junit',
  reporterOptions: {
    "mochaFile": "cypress/results/results-[hash].xml",
    "toConsole": true
  }
})
