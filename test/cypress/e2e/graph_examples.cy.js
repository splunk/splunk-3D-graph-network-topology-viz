describe('Graph Examples', {
    // retries: {
    //     runMode: 2, // might fail headlessly due to slow page load
    // }
}, () => {
    describe("Validates data on the [Bitcoin Transactions] dashboard", () => {
        afterEach(() => {
            cy.splunkLogout();
        });

        it("renders without errors", () => {
            cy.formatUrl(Cypress.env("cmc_uri") + "/graph_analysis_example_for_bitcoin_transactions", {}).then(
                (url) => {
                    cy.visitWithLogin(url);
                }
            );

            // Check there's no error
            cy.wait(5000).get('.dashboard-header-title').should('have.text', 'Graph Analysis Example for Bitcoin Transactions');
            cy.get('div.alert.alert-error').should('not.exist');
        });
    });

    describe("Validates data on the [Network Traffic] dashboard", () => {
        afterEach(() => {
            cy.splunkLogout();
        });

        it("renders without errors", () => {
            cy.formatUrl(Cypress.env("cmc_uri") + "/graph_analysis_example_for_network_traffic", {}).then(
                (url) => {
                    cy.visitWithLogin(url);
                }
            );

            cy.wait(5000).get('.dashboard-header-title').should('have.text', 'Graph Analysis Example for Network Traffic');
            cy.get('div.alert.alert-error').should('not.exist');
        });
    });

    describe("Validates data on the [Connected Compoenents] dashboard", () => {
        afterEach(() => {
            cy.splunkLogout();
        });

        it("renders without errors", () => {
            cy.formatUrl(Cypress.env("cmc_uri") + "/graph_analysis_example_connected_components", {}).then(
                (url) => {
                    cy.visitWithLogin(url);
                }
            );

            // Check there's no error
            cy.wait(5000).get('.dashboard-header-title').should('have.text', 'Graph Analysis Example: Connected Components');
            cy.get('div.alert.alert-error').should('not.exist');
        });
    });

    describe("Validates data on the [Label Propagation] dashboard", () => {
        afterEach(() => {
            cy.splunkLogout();
        });

        it("renders without errors", () => {
            cy.formatUrl(Cypress.env("cmc_uri") + "/graph_analysis_example_label_propagation", {}).then(
                (url) => {
                    cy.visitWithLogin(url);
                }
            );

            // Check there's no error
            cy.wait(5000).get('.dashboard-header-title').should('have.text', 'Graph Analysis Example: Label Propagation');
            cy.get('div.alert.alert-error').should('not.exist');
        });
    });
});