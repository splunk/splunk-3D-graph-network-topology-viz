describe('Graph Analysis', {
    // retries: {
    //     runMode: 2, // might fail headlessly due to slow page load
    // }
}, () => {
    describe("Validates data on dashboard", () => {
        afterEach(() => {
            cy.splunkLogout();
        });

        it("components render properly", () => {
            cy.formatUrl(Cypress.env("cmc_uri") + "/graph_analysis", {}).then(
                (url) => {
                    cy.visitWithLogin(url);
                }
            );

            // Buttons
            cy.get('#cidds', { timeout: 10000 }).should('exist').and('be.visible').and('not.be.disabled');
            cy.get('#bitcoin', { timeout: 10000 }).should('exist').and('be.visible').and('not.be.disabled');
            cy.get('#internal', { timeout: 10000 }).should('exist').and('be.visible').and('not.be.disabled');

            // Search bar
            cy.wait(5000).get('#mysearchbar1').should('exist').and('be.visible');
        });

        it("internal log data sources render properly", () => {
            cy.formatUrl(Cypress.env("cmc_uri") + "/graph_analysis", {}).then(
                (url) => {
                    cy.visitWithLogin(url);
                }
            );

            cy.get('#internal', { timeout: 10000 }).click();
            // Table with search results shown
            cy.get('.splunk-table').should('exist');
            // Dropdown buttons to select fields shown
            cy.get('.splunk-dropdown').should('have.length', 3);
        });
        // TODO extend tests
    });
});