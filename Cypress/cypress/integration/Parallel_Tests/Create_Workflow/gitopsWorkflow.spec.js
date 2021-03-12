/// <reference types="Cypress" />
import * as workflows from "../../../fixtures/Workflows.json";

let user;
describe("Testing the create Workflow Utility", () => {
  before("Clearing the Cookies and deleting the ", () => {
    cy.fixture("Users").then((User) => {
      user = User;
      cy.requestLogin(user.AdminName, user.AdminPassword);
    });
    cy.wait(8000); // Needs to be removed after frontend is fixed.
  });

  it("Checking accessiblity of GitOps Panel", () => {
    cy.visit("/settings");
    cy.get("[data-cy=gitOps]").click();
  });
});
