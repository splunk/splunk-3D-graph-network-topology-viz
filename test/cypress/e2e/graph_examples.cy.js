describe('Graph Examples', {
    // retries: {
    //     runMode: 2, // might fail headlessly due to slow page load
    // }
}, () => {
    describe("Validates data on the [Bitcoin Transactions] dashboard", () => {
        beforeEach(() => {
            cy.splunkLogin();
            cy.visit(Cypress.env("cmc_uri") + "/graph_analysis_example_for_bitcoin_transactions");
        });
        afterEach(() => {
            cy.splunkLogout();
        });

        it("renders without errors", () => {
            cy.get('.dashboard-header-title', { timeout: 10000 }).should('have.text', 'Graph Analysis Example for Bitcoin Transactions');
            cy.get('div.alert.alert-error').should('not.exist');
        });
    });

    describe("Validates data on the [Network Traffic] dashboard", () => {
        beforeEach(() => {
            cy.splunkLogin();
            cy.visit(Cypress.env("cmc_uri") + "/graph_analysis_example_for_network_traffic");
        });
        afterEach(() => {
            cy.splunkLogout();
        });

        it("renders without errors", () => {
            cy.get('.dashboard-header-title', { timeout: 10000 }).should('have.text', 'Graph Analysis Example for Network Traffic');
            cy.get('div.alert.alert-error').should('not.exist');
        });
    });

    describe("Validates data on the [Connected Compoenents] dashboard", () => {
        beforeEach(() => {
            cy.splunkLogin();
            cy.visit(Cypress.env("cmc_uri") + "/graph_analysis_example_connected_components");
        });
        afterEach(() => {
            cy.splunkLogout();
        });

        it("renders without errors", () => {
            cy.get('.dashboard-header-title', { timeout: 10000 }).should('have.text', 'Graph Analysis Example: Connected Components');
            cy.get('div.alert.alert-error').should('not.exist');
        });
    });

    describe("Validates data on the [Label Propagation] dashboard", () => {
        beforeEach(() => {
            cy.splunkLogin();
            cy.visit(Cypress.env("cmc_uri") + "/graph_analysis_example_label_propagation");
        });
        afterEach(() => {
            cy.splunkLogout();
        });

        it("renders without errors", () => {
            cy.get('.dashboard-header-title', { timeout: 10000 }).should('have.text', 'Graph Analysis Example: Label Propagation');
            cy.get('div.alert.alert-error').should('not.exist');
        });
    });
});