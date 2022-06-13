/// <reference types="Cypress" />
import * as user from "../../../fixtures/Users.json";

export const agent = Cypress.env("AGENT");

describe("Testing CRUD operation with MyHub", () => {
  before(
    "Clearing the cookies, login as admin and visiting the MyHub route",
    () => {
      cy.requestLogin(user.AdminName, user.AdminPassword);
      cy.waitForCluster(agent);
      cy.visit("/myhub");
    }
  );

  it("Adding a new MyHub with incorrect details", () => {
    cy.get("[data-cy=myHubConnectButton]").click();
    cy.wait(1000);
    cy.get("[data-cy=hubName] input").clear().type("my-test-hub");
    cy.get("[data-cy=githubURLInput]")
      .find("input")
      .eq(0)
      .clear()
      .type("test-myhub.com");
    cy.get("[data-cy=githubBranchInput]")
      .find("input")
      .eq(0)
      .clear()
      .type("master");
    cy.get("[data-cy=MyHubSubmit]").should("be.disabled");
    cy.get("[data-cy=cancel]").click();
  });

  it("Adding a new MyHub with correct details", () => {
    cy.GraphqlWait("addChaosHub", "addNewMyHub");
    cy.get("[data-cy=myHubConnectButton]").click();
    cy.wait(1000);
    cy.get("[data-cy=hubName] input").clear().type("my-test-hub");
    cy.get("[data-cy=githubURLInput]")
      .find("input")
      .eq(0)
      .clear()
      .type("https://github.com/litmuschaos/chaos-charts");
    cy.get("[data-cy=githubBranchInput]")
      .find("input")
      .eq(0)
      .clear()
      .type("master");
    cy.get("[data-cy=MyHubSubmit]")
      .should("be.enabled")
      .click()
      .then(() => {
        cy.wait("@addNewMyHub").its("response.statusCode").should("eq", 200);
      });
    cy.get("[data-cy=myHubAlert]").should("be.visible");
  });

  it("Update an existing MyHub details (Update operation)", () => {
    cy.GraphqlWait("updateChaosHub", "updateExistingMyHub");
    cy.get("[data-cy=myHubCardOption]").eq(1).click();
    cy.get("[data-cy=myHubOptions]").should("be.visible");
    cy.get("[data-cy=editHub]").eq(1).click();
    cy.get("[data-cy=hubName]")
      .find("input")
      .eq(0)
      .should("be.visible")
      .clear()
      .type("my-test-hub-updated");
    cy.get("[data-cy=githubURLInput]")
      .find("input")
      .eq(0)
      .clear()
      .type("https://github.com/litmuschaos/chaos-charts", { force: true });
    cy.get("[data-cy=githubBranchInput]")
      .find("input")
      .eq(0)
      .clear()
      .type("v1.13.x");
    cy.get("[data-cy=MyHubSubmit]")
      .should("be.enabled")
      .click()
      .then(() => {
        cy.wait("@updateExistingMyHub")
          .its("response.statusCode")
          .should("eq", 200);
      });
    cy.get("[data-cy=myHubAlert]").should("be.visible");
  });

  it("Deleting a MyHub", () => {
    cy.GraphqlWait("deleteChaosHub", "deleteExisitingMyHub");
    cy.get("[data-cy=myHubCardOption]").eq(1).click();
    cy.get("[data-cy=myHubOptions]").should("be.visible");
    cy.get("[data-cy=myHubDelete]")
      .contains("p", "Disconnect Hub")
      .then(($div) => {
        cy.wrap($div).click({ force: true });
      });
    cy.get("[data-cy=deleteHubModal]")
      .should("be.visible")
      .find("button")
      .eq(2)
      .then(($div) => {
        cy.wrap($div).click();
      });
  });
});
