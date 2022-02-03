/// ************************** Dashboard Configuration and Validation **********************

Cypress.Commands.add("configureDashboard", (configureDashboard) => {
  cy.get("[data-cy=inputDashboardName] input")
    .clear()
    .type(configureDashboard.name);
  cy.get("[data-cy=agentName] [tabIndex=0]").should(
    "have.text",
    configureDashboard.agent
  );
  cy.get("[data-cy=selectDatasource]").click();
  cy.get(`[data-cy=${configureDashboard.dataSource}]`).eq(0).click();
  cy.get("[data-cy=inputDashboardType] input").should(
    "have.value",
    configureDashboard.dashboardType
  );
  cy.get("[data-cy=selectNamespaces]")
    .clear()
    .type(configureDashboard.namespace);
  cy.get("li").eq(1).click();
  cy.get("[data-cy=applicationType]").click();
  cy.get(`[data-cy=${configureDashboard.applicationType}]`).click();
});
