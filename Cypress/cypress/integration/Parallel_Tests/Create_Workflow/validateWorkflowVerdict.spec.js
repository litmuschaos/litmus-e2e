// <reference types="Cypress" />
import * as user from "../../../fixtures/Users.json";
import * as workflows from "../../../fixtures/Workflows.json";
import * as targetApp from "../../../fixtures/TargetApplication.json";

describe("Testing the validation of the final verdict", () => {
	before("Loggin in and checking if agent exists", () => {
		cy.requestLogin(user.AdminName, user.AdminPassword);
		cy.waitForCluster("Self-Agent");
		cy.visit("/create-workflow");
	});

	it("Checking final verdict without target application", () => {
		cy.chooseAgent(0);
		cy.get("[data-cy=ControlButtons] Button").eq(0).click();
		cy.chooseWorkflow(2, 0);

		// Providing a name of 55 characters which should fail
		// Maximum allowed length is 54 characters
		cy.configureWorkflowSettings(
			workflows.extraLargeName,
			workflows.customWorkflowDescription,
			0
		);

		cy.get("[data-cy=ControlButtons] Button").eq(1).click();

		// Check if Alert exists
		cy.get("[role=alert]").should("be.visible");

		// Provide the correct details
		cy.configureWorkflowSettings(
			workflows.customWorkflow,
			workflows.customWorkflowDescription,
			0
		);
		cy.get("[data-cy=ControlButtons] Button").eq(1).click();

		/***
		 * Add an experiment containing pod text
		 */
		cy.get("[data-cy=addExperimentButton]").should("be.visible");
		cy.get("[data-cy=addExperimentButton]").click();
		/**
		 * Waiting for the search experiment field to be visible
		 */
		cy.get("[data-cy=addExperimentSearch]").should("be.visible");
		cy.get("[data-cy=addExperimentSearch]").find("input").clear().type("pod");
		cy.get("[data-cy=ExperimentList] :radio").eq(0).check();
		cy.get("[data-cy=AddExperimentDoneButton]").click();
		/**
		 * Waiting for the dagre animation to complete after closing the
		 * add experiment modal
		 */
		cy.wait(1000);
		cy.get("table")
			.find("tr")
			.eq(1)
			.then(($div) => {
				cy.wrap($div)
					.find("td")
					.eq(0)
					.should("contain.text", "pod") // Matching Status
					.click();
			});
		cy.wait(1000);
		cy.get("[data-cy=General] Button").eq(0).click();
		cy.get("[data-cy=TargetApplication]").find("input").eq(2).clear().type(targetApp.targetApplication);
		cy.get("[data-cy=TargetApplication] Button").eq(5).click();
		cy.get("[data-cy=SteadyState] Button").eq(2).click();
		cy.get("[data-cy=TuneExperiment] Button").eq(3).click();
		cy.wait(1000);
		cy.get("[data-cy=ControlButtons] Button").eq(1).click();
		cy.rScoreEditor(5);
		cy.get("[data-cy=ControlButtons] Button").eq(1).click();
		cy.selectSchedule(0);
		cy.get("[data-cy=ControlButtons] Button").eq(1).click();
		cy.verifyDetails(
			workflows.customWorkflow,
			workflows.customWorkflowDescription,
			0
		);
		cy.wait(1000);
		cy.get("[data-cy=ControlButtons] Button").eq(0).click(); // Clicking on finish Button
		cy.get("[data-cy=FinishModal]").should("be.visible");
		cy.get("[data-cy=WorkflowName]").then(($name) => {
			let workflowName = $name.text();
			cy.validateVerdict(workflowName, "Self-Agent", "Failed", 0, 0, 1);
			return;
		});
	});
});