// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('splunkLogin', () => {
  const loginPath = '/en-US/account/login';

  cy.visit(loginPath);

  cy.get('input[name=username]').type(Cypress.env('splunk_user')); 
  cy.get('input[name=password]').type(Cypress.env('splunk_password'));
  cy.get("input[type=submit][value='Sign In']").click();

  cy.url().should('include', '/home');
})

Cypress.Commands.add('splunkLogout', () => {
  // cy.window().then((win) => {
    //   win.sessionStorage.removeItem('userToken');
    // });
  cy.request('/en-US/account/logout');
})
