/// <reference types="Cypress" />
//This Script provides plugins and common utilities for tests.

//// ******************* Plugins Added *****************************
import '@4tw/cypress-drag-drop';
import "cypress-file-upload";
import "cypress-wait-until";

//Custom Command for waiting for required Agent to come in active state.
Cypress.Commands.add("waitForCluster", (agentName) => {
  cy.visit("/targets");
  // Checking if required Agent is there.
  // cy.get("table").contains("td", agentName).should("be.visible");
  // Wait for Agent to be active
  cy.waitUntil(
    () =>
      cy
        .contains("td", agentName)
        .parent()
        .children()
        .eq(0)
        .then(($div) => {
          return $div.text() == "Active" ? true : false;
        }),
    {
      verbose: true,
      interval: 500,
      timeout: 60000,
    }
  );
});

// GraphQL Waiting
Cypress.Commands.add("GraphqlWait", (operationName, alias) => {
  cy.intercept("POST", Cypress.env("apiURL") + "/query", (req) => {
    if (req.body.operationName.includes(operationName)) {
      req.alias = alias;
    }
  });
});

//Custom command for Logut.
Cypress.Commands.add("logout", () => {
  cy.get("[data-cy=headerProfileDropdown]").click();
  cy.get("[data-cy=logoutButton] button").click();
});

//Custom command for closing modal.
Cypress.Commands.add("modalClose", () => {
  cy.get("[data-cy=done]").should("be.visible");
  cy.get("[data-cy=done]").click();
});
