/// <reference types="Cypress" />
import * as user from "../../../fixtures/Users.json";

export const agent = Cypress.env("AGENT");
export const dataSourceUrl = Cypress.env("DATA_SOURCE_URL");

describe("Testing the addition of data source", () => {
  before("Clearing the Cookies and deleting the Cookies", () => {
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.waitForCluster(agent);
  });

  it("Creating a data source with incorrect details", () => {
    cy.visit("/analytics");
    cy.get("[data-cy='data source']").should("be.visible");
    cy.get("[data-cy='data source']").click();
    cy.get("[data-cy=addDataSource]").click();

    cy.get("[data-cy=inputDataSourceName] input").clear().type("data-source-1");
    cy.get("[data-cy=dataSourceControlButton]").click();

    cy.get("[data-cy=dataSourceControlButton]").click();

    cy.get("[role=alert]").should("be.visible");
    cy.get("[role=alert]").should(
      "have.text",
      "Error connecting to the data source"
    );
  });

  it("Creating a data source with correct details", () => {
    cy.visit("/analytics");
    cy.get("[data-cy='data source']").should("be.visible");
    cy.get("[data-cy='data source']").click();
    cy.get("[data-cy=addDataSource]").click();

    cy.get("[data-cy=dataSourceControlButton]").should("be.disabled");
    cy.get("[data-cy=inputDataSourceName] input").clear().type("data-source-1");
    cy.get("[data-cy=inputDataSourceType] input").should(
      "have.value",
      "Prometheus"
    );
    cy.get("[data-cy=inputDataSourceURL] input").clear().type(dataSourceUrl);
    cy.get("[data-cy=inputDataSourceAccess] input").should(
      "have.value",
      "Server (Default)"
    );
    cy.get("[data-cy=dataSourceControlButton]").should("not.be.disabled");
    cy.get("[data-cy=dataSourceControlButton]").click();

    cy.get("[data-cy=authRadioGroup] input").eq(0).should("be.checked");
    let configureDataSource = {
      scrapeInterval: "15s",
      queryTimeOut: "30s",
      httpMethod: "POST",
    };
    cy.get("[data-cy=inputScrapeInterval] input")
      .clear()
      .type(configureDataSource.scrapeInterval);
    cy.get("[data-cy=inputQueryTimeout] input")
      .clear()
      .type(configureDataSource.queryTimeOut);
    cy.get("[data-cy=inputHTTPMethod] input").should(
      "have.value",
      configureDataSource.httpMethod
    );
    cy.get("[data-cy=dataSourceControlButton]").click();

    cy.get("[role=alert]").should("be.visible");
    cy.get("[role=alert]").should(
      "have.text",
      "Successfully connected to the data source"
    );
  });

  it("Checking data source table", () => {
    cy.GraphqlWait("listDataSource", "dataSources");
    cy.visit("/analytics");
    cy.wait("@dataSources").its("response.statusCode").should("eq", 200);
    cy.get("table")
      .find("tr")
      .eq(1)
      .then(($div) => {
        cy.wrap($div).find("td").eq(0).should("have.text", "Active");
        cy.wrap($div).find("td").eq(1).should("have.text", "data-source-1");
        cy.wrap($div).find("td").eq(2).should("have.text", "Prometheus");
      });
  });

  it("Changing name of existing datasource and validating it", () => {
    cy.visit("/analytics");
    cy.get("[data-cy='data source']").click();
    cy.get("[data-cy=browseDataSourceOptions]").eq(0).click();
    cy.get("[data-cy=configureDatasource]").eq(0).click();

    cy.get("[data-cy=inputDataSourceName] input").clear().type("data-source-2");
    cy.get("[data-cy=dataSourceControlButton]").click();

    cy.get("[data-cy=dataSourceControlButton]").click();

    cy.get("[role=alert]").should("be.visible");
    cy.get("[role=alert]").should(
      "have.text",
      "Successfully updated the data source information"
    );

    cy.GraphqlWait("listDataSource", "dataSources");
    cy.visit("/analytics");
    cy.wait("@dataSources").its("response.statusCode").should("eq", 200);
    cy.get("table")
      .find("tr")
      .eq(1)
      .then(($div) => {
        cy.wrap($div).find("td").eq(0).should("have.text", "Active");
        cy.wrap($div).find("td").eq(1).should("have.text", "data-source-2");
        cy.wrap($div).find("td").eq(2).should("have.text", "Prometheus");
      });
  });

  it("Configure data source with incorrect details", () => {
    cy.visit("/analytics");
    cy.get("[data-cy=browseDataSourceOptions]").eq(0).click();
    cy.get("[data-cy=configureDatasource]").eq(0).click();

    cy.get("[data-cy=inputDataSourceURL] input")
      .clear()
      .type("http://localhost:9090");
    cy.get("[data-cy=dataSourceControlButton]").click();

    cy.get("[data-cy=dataSourceControlButton]").click();

    cy.get("[role=alert]").should("be.visible");
    cy.get("[role=alert]").should(
      "have.text",
      "Error updating the data source information"
    );
  });

  it("Delete data source", () => {
    cy.visit("/analytics");
    cy.get("[data-cy=browseDataSourceOptions]").eq(0).click();
    cy.get("[data-cy=deleteDatasource]").eq(0).click();
    cy.get("[data-cy=deleteDataSourceModal]").should("be.visible");
    cy.get("[data-cy=deleteDataSourceModal] button").eq(1).click();

    cy.get("[role=alert]").should(
      "have.text",
      "Successfully deleted the data source"
    );

    cy.get("table")
      .find("tr")
      .find("td")
      .should("have.text", "No data source available");
  });
});
