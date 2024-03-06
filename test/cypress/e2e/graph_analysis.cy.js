describe('Graph Analysis', {
    // retries: {
    //     runMode: 2, // might fail headlessly due to slow page load
    // }
}, () => {
    beforeEach(() => {
        cy.splunkLogin();
    });

    afterEach(() => {
        cy.splunkLogout();
    });

    describe("Validates data on dashboard", () => {
        beforeEach(() => {
            cy.visit(Cypress.env("cmc_uri") + "/graph_analysis");
        });

        it("navigation works", () => {
            // Check the URL is correct
            cy.location().should((loc) => {
                expect(loc.pathname).to.eq('/en-US/app/splunk-3D-graph-network-topology-viz/graph_analysis');
            });
        })

        it("components render properly", () => {
            // Buttons
            cy.get('#cidds', { timeout: 10000 }).should('exist').and('be.visible').and('not.be.disabled');
            cy.get('#bitcoin', { timeout: 10000 }).should('exist').and('be.visible').and('not.be.disabled');
            cy.get('#internal', { timeout: 10000 }).should('exist').and('be.visible').and('not.be.disabled');

            // Search bar
            cy.get('#mysearchbar1', { timeout: 10000 }).should('exist').and('be.visible');
        });

        it("internal log data sources render properly", () => {
            cy.get('#internal', { timeout: 10000 }).click();
            // Table with search results shown
            cy.get('.splunk-table', { timeout: 10000 }).should('exist');
            // Dropdown buttons to select fields shown
            cy.get('.splunk-dropdown', { timeout: 10000 }).should('have.length', 3);
        });
        // TODO extend tests
    });
});