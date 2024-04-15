describe('Graph Analysis', {
    // retries: {
    //     runMode: 2, // might fail headlessly due to slow page load
    // }
}, () => {
    beforeEach(() => {
        cy.splunkLogin();
        cy.intercept(
            {
                method: 'GET',
                pathname:
                    '/en-GB/splunkd/__raw/servicesNS/admin/splunk-3D-graph-network-topology-viz/scheduled/views/graph_analysis',
                query: {
                    output_mode: 'json',
                },
            }
        ).as('hasPageLoaded');
        cy.visit(Cypress.env("cmc_uri") + "/graph_analysis");
    });

    afterEach(() => {
        cy.splunkLogout();
    });

    describe("Validates data on dashboard", () => {
        it("navigation works", () => {
            // Check the URL is correct
            cy.location().should((loc) => {
                expect(loc.pathname).to.eq('/en-US/app/splunk-3D-graph-network-topology-viz/graph_analysis');
            });
        })

        it("components render properly", () => {
            cy.wait('@hasPageLoaded').then((interception) => {
                /* eslint-disable no-unused-expressions */
                expect(interception.response.body).not.to.be.empty;
            });

            // Buttons
            cy.get('#cidds', { timeout: 10000 }).should('exist').and('be.visible').and('not.be.disabled');
            cy.get('#bitcoin', { timeout: 10000 }).should('exist').and('be.visible').and('not.be.disabled');
            cy.get('#internal', { timeout: 10000 }).should('exist').and('be.visible').and('not.be.disabled');

            // Search bar
            cy.get('#mysearchbar1', { timeout: 10000 }).should('exist').and('be.visible');
        });

        it("internal log data sources render properly", () => {
            cy.wait('@hasPageLoaded').then((interception) => {
                /* eslint-disable no-unused-expressions */
                expect(interception.response.body).not.to.be.empty;
            });

            cy.get('#internal', { timeout: 10000 }).click();
            // Table with search results shown
            cy.get('.splunk-table', { timeout: 10000 }).should('exist');
            // Dropdown buttons to select fields shown
            cy.get('.splunk-dropdown', { timeout: 10000 }).should('have.length', 3);
            // Waiting for search to be done and dropdowns under "Select Fields" section to be shown
            // Otherwise logout will be triggered and pending searches will throw errors
            // cy.get("button[data-test='select']", { timeout: 10000 }).should('have.length', 3);
            cy.get("div#statistics.viz-controller table", { timeout: 10000 }).eq(0).find('thead').should('be.visible');
            cy.get("div#statistics.viz-controller table", { timeout: 10000 }).eq(0).find('thead').should('exist');
        });
        // TODO extend tests
    });
});