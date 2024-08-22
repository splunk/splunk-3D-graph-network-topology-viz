const max_waiting = 25000;

describe('Graph Examples', {
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
            cy.get('.dashboard-header-title', { timeout: max_waiting }).should('have.text', 'Graph Analysis Example for Bitcoin Transactions');
            cy.get('.force-graph-container canvas', { timeout: max_waiting }).should('exist');
            cy.get('.force-graph-container canvas', { timeout: max_waiting }).should('be.visible');
            // cy.get('div.alert.alert-error', {timeout: max_waiting}).should('not.exist');
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
            cy.get('.dashboard-header-title', { timeout: max_waiting }).should('have.text', 'Graph Analysis Example for Network Traffic');
            cy.get('.force-graph-container canvas', { timeout: max_waiting }).should('exist');
            cy.get('.force-graph-container canvas', { timeout: max_waiting }).should('be.visible');
            // cy.get('div.alert.alert-error', { timeout: max_waiting }).should('not.exist');
        });
    });

    describe("Validates data on the [Connected Components] dashboard", () => {
        beforeEach(() => {
            cy.splunkLogin();
            cy.visit(Cypress.env("cmc_uri") + "/graph_analysis_example_connected_components");
        });
        afterEach(() => {
            cy.splunkLogout();
        });

        it("renders without errors", () => {
            cy.get('.dashboard-header-title', { timeout: max_waiting }).should('have.text', 'Graph Analysis Example: Connected Components');
            cy.get('.force-graph-container canvas', { timeout: max_waiting }).should('exist');
            cy.get('.force-graph-container canvas', { timeout: max_waiting }).should('be.visible');
            // cy.get('div.alert.alert-error', { timeout: max_waiting }).should('not.exist');
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
            cy.get('.dashboard-header-title', { timeout: max_waiting }).should('have.text', 'Graph Analysis Example: Label Propagation');
            cy.get('.force-graph-container canvas', { timeout: max_waiting }).should('exist');
            cy.get('.force-graph-container canvas', { timeout: max_waiting }).should('be.visible');
            // cy.get('div.alert.alert-error', { timeout: max_waiting }).should('not.exist');
        });
    });
});