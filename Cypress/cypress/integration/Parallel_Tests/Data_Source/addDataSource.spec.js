/// <reference types="Cypress" />
import * as user from "../../../fixtures/Users.json";

export const agent = Cypress.env("AGENT");

describe("Testing the addition of data source", () => {
  before("Clearing the Cookies and deleting the Cookies", () => {
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.waitForCluster(agent);
    cy.visit("/observability");
  });

  it("Creating a data source", () => {
    cy.get("[data-cy='data source']").should("be.visible");
    cy.get("[data-cy='data source']").click();
  });
});
