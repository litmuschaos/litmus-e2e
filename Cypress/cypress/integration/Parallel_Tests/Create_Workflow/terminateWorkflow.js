/// <reference types="Cypress" />
import * as workflows from "../../../fixtures/Workflows.json";
import * as user from "../../../fixtures/Users.json";

export const workflowNamespace = Cypress.env("agent_namespace");
export const agent = Cypress.env("agent");

describe("Testing the terminate workflow", () => {
    before("Clearing the Cookies and deleting the Cookies", () => {
        cy.requestLogin(user.AdminName, user.AdminPassword);
        cy.waitForCluster(agent);
        cy.visit("/create-workflow");
    });

    let workflowName = '';
    let workflowSubject = '';

    it("Running Workflow by uploading it", () => {
        cy.chooseAgent(agent);
        cy.get("[data-cy=ControlButtons] Button").eq(0).click();
        cy.chooseWorkflow(3, "");
        cy.wait(500);
        cy.get("[data-cy=ControlButtons] Button").eq(1).click();
        cy.wait(1000); // Waiting for Workflow Details to get filled
        cy.get("[data-cy=WorkflowNamespace] input")
            .should("have.value", workflowNamespace);
        cy.get("[data-cy=ControlButtons] Button").eq(1).click();
        cy.selectSchedule(0);
        cy.get("[data-cy=ControlButtons] Button").eq(1).click();
        cy.wait(1000);
        cy.get("[data-cy=ControlButtons] Button").eq(0).click(); // Clicking on finish Button
        cy.get("[data-cy=FinishModal]").should("be.visible");
        cy.get("[data-cy=WorkflowName]").then(($name) => {
            workflowName = $name.text();
            return;
        });
        cy.get("[data-cy=WorkflowSubject]").then(($subject) => {
            workflowSubject = $subject.text();
            return;
        });
        cy.get("[data-cy=GoToWorkflowButton]").click();
    });

    it("Terminating the workflow", () => {
        cy.validateWorkflowStatus(workflowName, workflowNamespace, ["Running"]);
        cy.visit("/workflows");
        cy.GraphqlWait("workflowListDetails", "listSchedules");
        cy.wait("@listSchedules").its("response.statusCode").should("eq", 200);
        cy.terminateWorkflow();
        cy.get("[data-cy=WorkflowStatus]")
            .eq(0)
            .should("have.text", "Terminated");
        cy.wait(500);
        cy.validateWorkflowExistence(workflowName, workflowNamespace, false);
    });
});