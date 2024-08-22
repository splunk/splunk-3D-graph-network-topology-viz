const max_waiting = 25000;

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
                    // From Splunk 9.2 following API has changed to **/search/v2/jobs/admin** - Replaced!
                    // '/en-US/splunkd/__raw/servicesNS/admin/splunk-3D-graph-network-topology-viz/search/jobs/admin**',
                    '/en-US/splunkd/__raw/servicesNS/admin/splunk-3D-graph-network-topology-viz/search/v2/jobs/admin**',
                    // '/en-US/splunkd/__raw/services/search/timeparser',
                    // '/en-US/splunkd/__raw/services/server/health/splunkd',
                query: {
                    output_mode: 'json',
                }
                // times: 1
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
                expect(interception.response.body).not.to.be.empty;

                // Buttons
                cy.get('#cidds', { timeout: max_waiting }).should('exist').and('be.visible').and('not.be.disabled');
                cy.get('#bitcoin', { timeout: max_waiting }).should('exist').and('be.visible').and('not.be.disabled');
                cy.get('#internal', { timeout: max_waiting }).should('exist').and('be.visible').and('not.be.disabled');

                // Search bar
                cy.get('#mysearchbar1', { timeout: max_waiting }).should('exist').and('be.visible');
            });
        });

        it("internal log data sources render properly", () => {
            cy.wait('@hasPageLoaded', { timeout: 10000 }).then((interception) => {
                expect(interception.response.body).not.to.be.empty;

                cy.get('#internal').click();
                // UGLY but works to wait for the searches to run
                cy.wait(10000);
                // Table with search results shown
                cy.get('.splunk-table').should('exist');
                // Dropdown buttons to select fields shown
                cy.get('.splunk-dropdown').should('have.length', 3);
                // Waiting for search to be done and dropdowns under "Select Fields" section to be shown
                // Otherwise logout will be triggered and pending searches will throw errors
                cy.get("div#statistics.viz-controller table").eq(0).find('thead').should('be.visible');
                cy.get("div#statistics.viz-controller table").eq(0).find('thead').should('exist');
            });
        });
    });
});