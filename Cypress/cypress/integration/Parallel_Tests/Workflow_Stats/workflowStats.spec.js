/// <reference types="Cypress" />
import * as user from "../../../fixtures/Users.json";

describe("Testing the accessibility of workflow statistics Tab.", () => {
  before("Clearing the Cookies and deleting the Cookies", () => {
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.waitForCluster("Self-Agent");
    cy.visit("/observability");
  });

  it("Testing workflow stats tab", () => {
    cy.get("[data-cy=litmusDashboard]").should("be.visible");
    cy.get("[data-cy=litmusDashboard]").click();
  });
});
