/// <reference types="Cypress" />
import * as user from "../../../fixtures/Users.json";

export const agent = Cypress.env("AGENT");
export const dataSourceUrl = Cypress.env("DATA_SOURCE_URL");

describe("Testing the creation of dashboard", () => {
  before("Clearing the Cookies and deleting the Cookies", () => {
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.waitForCluster(agent);
  });

  const configureDashboard = {
    name: "Node-metrics-1",
    agent: agent,
    dataSource: "data-source-1",
    dashboardType: "Node metrics",
    namespace: "monitoring",
    applicationType: "pods",
  };

  it("Creating a data source", () => {
    cy.visit("/analytics");
    cy.get("[data-cy='data source']").should("be.visible");
    cy.get("[data-cy='data source']").click();
    cy.get("[data-cy=addDataSource]").click();

    cy.get("[data-cy=dataSourceControlButton]").should("be.disabled");
    cy.get("[data-cy=inputDataSourceName] input").clear().type("data-source-1");
    cy.get("[data-cy=inputDataSourceURL] input").clear().type(dataSourceUrl);
    cy.get("[data-cy=dataSourceControlButton]").should("not.be.disabled");
    cy.get("[data-cy=dataSourceControlButton]").click();

    cy.get("[data-cy=dataSourceControlButton]").click();

    cy.get("[role=alert]").should("be.visible");
    cy.get("[role=alert]").should(
      "have.text",
      "Successfully connected to the data source"
    );
  });

  it("Create a new dashboard", () => {
    cy.visit("/analytics");
    cy.get("[data-cy='monitoringDashboard']").should("be.visible");
    cy.get("[data-cy='monitoringDashboard']").click();
    cy.get("[data-cy=createDashboard]").click();

    cy.get("[data-cy=dashboardCard]").eq(0).click();

    cy.configureDashboard(configureDashboard);

    cy.get("[data-cy=dashboardControlButton] button").eq(1).click();

    cy.get("[type=checkbox]").eq(0).check();
    cy.get("[type=checkbox]").eq(1).check();

    cy.get("[data-cy=dashboardControlButton] button").eq(1).click();

    cy.get("[data-cy=saveChangesControlButton] button").eq(1).click();
  });

  it("Validate monitoring dashboard info", () => {
    cy.get("[data-cy=infoButton] button").eq(0).click();

    cy.get("[data-cy=name]").should("have.text", configureDashboard.name);
    cy.get("[data-cy=typeName]").should(
      "have.text",
      configureDashboard.dashboardType
    );
    cy.get("[data-cy=dataSourceName]").should(
      "have.text",
      configureDashboard.dataSource
    );
    cy.get("[data-cy=agentName]").should("have.text", configureDashboard.agent);

    cy.get('[data-cy="Chaos-Node-CPU Utilization"]').should("exist");
    cy.get('[data-cy="Chaos-Node-Memory Utilization"]').should("exist");
  });

  it("Validate dashboard table", () => {
    cy.GraphqlWait("listDashboard", "dashboardDetails");
    cy.visit("/analytics");
    cy.get("[data-cy='monitoringDashboard']").should("be.visible");
    cy.get("[data-cy='monitoringDashboard']").click();
    cy.wait("@dashboardDetails").its("response.statusCode").should("eq", 200);
    cy.get("table")
      .find("tr")
      .eq(1)
      .then(($div) => {
        cy.wrap($div)
          .find("td")
          .eq(0)
          .should("have.text", configureDashboard.name);
        cy.wrap($div)
          .find("td")
          .eq(1)
          .should("have.text", configureDashboard.agent);
        cy.wrap($div)
          .find("td")
          .eq(2)
          .should("have.text", configureDashboard.dashboardType);
        cy.wrap($div).find("td").eq(3).should("have.text", "Prometheus");
      });
  });

  it("Configure dashboard", () => {
    cy.get("[data-cy=browseDashboardOptions]").eq(0).click();
    cy.get("[data-cy=configureDashboard]").eq(0).click();

    cy.get("[data-cy=inputDashboardName] input").clear().type("Node-metrics-2");
    cy.get("[data-cy=controlButtons] button").eq(0).click();
    cy.get("[data-cy=controlButtons] button").eq(1).click();
  });

  it("Delete dashboard", () => {
    cy.GraphqlWait("listDashboard", "dashboardDetails");
    cy.visit("/analytics");
    cy.get("[data-cy='monitoringDashboard']").should("be.visible");
    cy.get("[data-cy='monitoringDashboard']").click();
    cy.wait("@dashboardDetails").its("response.statusCode").should("eq", 200);
    cy.get("[data-cy=browseDashboardOptions]").eq(0).click();
    cy.get("[data-cy=deleteDashboard]").eq(0).click();
    cy.get("[data-cy=removeDashboardModal]").should("be.visible");

    cy.get("[data-cy=removeDashboardModalButtons] button").eq(1).click();

    cy.get("[role=alert]").should(
      "have.text",
      "Successfully deleted the dashboard"
    );

    cy.get("table")
      .find("tr")
      .find("td")
      .should("have.text", "No dashboard available");
  });

  it("Delete data source", () => {
    cy.visit("/analytics");
    cy.get("[data-cy='data source']").click();
    cy.get("[data-cy=browseDataSourceOptions]").eq(0).click();
    cy.get("[data-cy=deleteDatasource]").eq(0).click();
    cy.get("[data-cy=deleteDataSourceModal]").should("be.visible");
    cy.get("[data-cy=deleteDataSourceModal] button").eq(1).click();

    cy.get("[role=alert]").should(
      "have.text",
      "Successfully deleted the data source"
    );
  });
});
