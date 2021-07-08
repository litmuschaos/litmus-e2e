/// <reference types="Cypress" />
import * as user from "../../../fixtures/Users.json";
import * as workflows from "../../../fixtures/Workflows.json";

describe("Testing the workflow creation wizard using Custom Experiments from Hub", () => {
	before("Loggin in and checking if agent exists", () => {
		cy.requestLogin(user.AdminName, user.AdminPassword);
		cy.waitForCluster("Self-Agent");
		cy.visit("/create-workflow");
	});

	it("Running Custom Workflow", () => {
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
		 * Waiting for the add experiment modal to open
		 */
		cy.wait(1000);
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
				cy.wrap($div).find("td").eq(0).should("contain.text", "pod"); // Matching Status
			});
		/***
		 * Add an experiment containing container text
		 */
		cy.get("[data-cy=addExperimentButton]").should("be.visible");
		cy.get("[data-cy=addExperimentButton]").click();
		cy.wait(1000);
		cy.get("[data-cy=addExperimentSearch]")
			.find("input")
			.clear()
			.type("container");
		cy.get("[data-cy=ExperimentList] :radio").eq(0).check();
		cy.get("[data-cy=AddExperimentDoneButton]").click();
		cy.wait(1000);
		cy.get("table")
			.find("tr")
			.eq(2)
			.then(($div) => {
				cy.wrap($div).find("td").eq(0).should("contain.text", "container"); // Matching Status
			});
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
					.should("include.text", workflows.customWorkflow); // Matching Workflow Name Regex
				cy.wrap($div).find("td").eq(3).should("have.text", "Self-Agent"); // Matching Target Agent
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
					.should("include.text", workflows.customWorkflow); // Matching Workflow Name Regex
				cy.wrap($div).find("td").eq(1).should("have.text", "Self-Agent"); // Matching Target Agent
			});
	});
});
