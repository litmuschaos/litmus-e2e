/// <reference types="Cypress" />
import * as workflows from "../../../fixtures/Workflows.json";
import * as user from "../../../fixtures/Users.json";

export const agent = Cypress.env("AGENT");

describe("Testing the create Workflow Utility", () => {
  before("Clearing the Cookies and deleting the Cookies", () => {
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.waitForCluster(agent);
    cy.visit("/settings");
  });

  it("Checking accessiblity of GitOps Panel", () => {
    cy.get("[data-cy=gitOps]").click();
    cy.get("[data-cy=localRadioButton] input[type=radio]").should("be.checked");
    cy.get("[data-cy=gitopsRadioButton] input[type=radio]").should(
      "not.be.checked"
    );
    cy.get("[data-cy=gitopsRadioButton] input[type=radio]").check();
    cy.get("[data-cy=connectButton] button").should("be.enabled");
    cy.get("[data-cy=githubURLInput] input").clear().type("URL");
    cy.get("[data-cy=githubBranchInput] input").clear().type("Branch");
    cy.get("[data-cy=accessTokenRadioButton] input[type=radio]").check();
    cy.get("[data-cy=accessTokenInput] input").should("be.visible");
    cy.get("[data-cy=sshKeyRadioButton] input[type=radio]").check();
    cy.get("[data-cy=sshKeyBox]").should("be.visible");
    // cy.get("[data-cy=sshKeyCopyButton] button").click();
  });
});
