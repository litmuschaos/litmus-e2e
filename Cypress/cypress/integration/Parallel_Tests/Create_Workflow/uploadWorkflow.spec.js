/// <reference types="Cypress" />
import * as workflows from "../../../fixtures/Workflows.json";
import * as user from "../../../fixtures/Users.json";

describe("Testing the create Workflow Utility", () => {
  before("Clearing the Cookies and deleting the Cookies", () => {
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.waitForCluster("Self-Agent");
    cy.visit("/create-workflow");
  });

  it("Running Workflows by uploading it", () => {
    cy.chooseAgent(0);
    cy.get("[data-cy=ControlButtons] Button").eq(0).click();
    cy.chooseWorkflow(3, "");
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.wait(500); // Waiting for Workflow Details to get filled
    cy.configureWorkflowSettings(
      workflows.nonRecurringworkflowName,
      workflows.nonRecurringworkflowDescription,
      0
    );
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.wait(1000); // Needs to be removed with frontend enhancement
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.rScoreEditor(5);
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.selectSchedule(0);
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.verifyDetails(
      workflows.nonRecurringworkflowName,
      workflows.nonRecurringworkflowDescription,
      0
    );
    cy.wait(1000);
    cy.get("[data-cy=ControlButtons] Button").eq(0).click(); // Clicking on finish Button
    cy.get("[data-cy=FinishModal]").should("be.visible");
    cy.get("[data-cy=GoToWorkflowButton]").click();
  });

  it("Checking Workflow Browsing Table for scheduled workflow", () => {
    cy.GraphqlWait("workflowDetails", "listWorkflows");
    cy.visit("/workflows");
    cy.wait("@listWorkflows").its("response.statusCode").should("eq", 200);
    cy.wait(1000);
    cy.get("table")
      .find("tr")
      .eq(1)
      .then(($div) => {
        cy.wrap($div).find("td").eq(1).should("have.text", "Running"); // Matching Status
        cy.wrap($div)
          .find("td")
          .eq(2)
          .should("include.text", workflows.nonRecurringworkflowName); // Matching Workflow Name Regex
        cy.wrap($div).find("td").eq(3).should("have.text", "Self-Agent"); // Matching Target Agent
        // cy.wrap($div).find("td [data-cy=browseWorkflowOptions]").click(); // Clicking on 3 Dots
        // cy.get("[data-cy=workflowDetails]").eq(0).click(); // Checking Workflow Graph And Other Details
      });
  });

  it("Checking Schedules Table for scheduled Workflow", () => {
    cy.GraphqlWait("workflowListDetails", "listSchedules");
    cy.get("[data-cy=browseSchedule]").click();
    cy.wait("@listSchedules").its("response.statusCode").should("eq", 200);
    cy.wait(1000);
    cy.get("table")
      .find("tr")
      .eq(1)
      .then(($div) => {
        cy.wrap($div)
          .find("td")
          .eq(0)
          .should("include.text", workflows.nonRecurringworkflowName); // Matching Workflow Name Regex
        cy.wrap($div).find("td").eq(1).should("have.text", "Self-Agent"); // Matching Target Agent
      });
  });
});
