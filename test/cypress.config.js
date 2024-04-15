const { defineConfig } = require('cypress')

// Ref. https://docs.cypress.io/guides/references/configuration
module.exports = defineConfig({
  //screenShotOnFailure: false,
  e2e: {
    env: {
      cmc_uri: '/en-US/app/splunk-3D-graph-network-topology-viz',
      splunk_user: 'admin',
      splunk_password: 'password',
    },
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:8000',
    defaultCommandTimeout: 40000,
    retries: 3,
    // chromeWebSecurity: false,
    pageLoadTimeout: 600000,
    // viewportWidth: 1000,
    // viewportHeight: 1200,
    video: true,
    videoCompression: false,
    // experimentalMemoryManagement: true,
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
    "mochaFile": "cypress/results/results-[hash].xml",
    "toConsole": true
  }
})
