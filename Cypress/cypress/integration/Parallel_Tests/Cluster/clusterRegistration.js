/// <reference types="Cypress" />
// import * as workflows from "../../../fixtures/Workflows.json";
import * as user from "../../../fixtures/Users.json";

describe("Testing the agent registration", () => {
  before("Clearing the Cookies and deleting the Cookies", () => {
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.waitForCluster("Self-Agent");
    cy.visit("/create-workflow");
  });

  it("Registering an Agent in Cluster-Scope", () => {
    // cy.exec("kubectl config use-context kind-testing");
    // Now Agent can be registered from here.
  });
});
