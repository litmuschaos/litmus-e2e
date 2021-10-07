/// <reference types="Cypress" />
import * as user from "../../../fixtures/Users.json";
import * as workflows from "../../../fixtures/Workflows.json";

describe("Testing the workflow creation wizard using PreDefined Experiments", () => {
	before("Clearing the Cookies and deleting the Cookies", () => {
		cy.requestLogin(user.AdminName, user.AdminPassword);
		cy.waitForCluster("Self-Agent");
		cy.visit("/create-workflow");
	});

	let workflowName = '';

	it("Running PreDefined Workflow", () => {
		cy.chooseAgent(0);
		cy.GraphqlWait("GetPredefinedWorkflowList", "getPredefinedData");
		cy.get("[data-cy=ControlButtons] Button").eq(0).click();
		
		cy.wait("@getPredefinedData");
		cy.chooseWorkflow(0, 0);

		// Providing a name of 55 characters which should fail
		// Maximum allowed length is 54 characters
		cy.configureWorkflowSettings(
			workflows.extraLargeName,
			workflows.nonRecurringworkflowDescription,
			0
		);

		cy.get("[data-cy=ControlButtons] Button").eq(1).click();

		// Check if Alert exists
		cy.get("[role=alert]").should("be.visible");
		
		// Provide the correct details
		cy.configureWorkflowSettings(
			workflows.nonRecurringworkflowName,
			workflows.nonRecurringworkflowDescription,
			0
		);
		cy.get("[data-cy=ControlButtons] Button").eq(1).click();
		cy.wait(3000);
		cy.get("table")
			.find("tr")
			.eq(1)
			.then(($div) => {
				cy.wrap($div).find("td").eq(0).should("contain.text", "pod"); // Matching Experiment
			});
		// Matching nodes of dagre graph
		cy.get("[data-cy=DagreGraphSvg]")
			.find("text")
			.then(($text) => {
				cy.wrap($text).find("tspan").eq(7).should("contain.text","install-application");
				cy.wrap($text).find("tspan").eq(9).should("contain.text","install-chaos-experiments");
				cy.wrap($text).find("tspan").eq(11).should("contain.text","pod-network-loss");
				cy.wrap($text).find("tspan").eq(13).should("contain.text","revert-chaos");
				cy.wrap($text).find("tspan").eq(14).should("contain.text","delete-application");
			});
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
		cy.get("[data-cy=WorkflowName]").then(($name) => {
			workflowName = $name.text();
			return;
		});
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
				// Workflow Statistics (Graph View)
				cy.wrap($div).find("td").eq(2)
					.invoke('attr', 'style', 'position: absolute')
					.should('have.attr', 'style', 'position: absolute');
				cy.wrap($div).find("td").eq(2).click();
			});
		// Wait for complete nodes to load
		cy.waitUntil(() =>
			cy.get("[data-cy=DagreGraphSvg]")
				.find("text")
				.then(($text) => {
					return $text.length >= 19 ? true : false;
				}),
			{
			  verbose: true,
			  interval: 500,
			  timeout: 600000,
			}
		);
		// Verify nodes in dagre graph
		cy.get("[data-cy=DagreGraphSvg]")
			.find("text")
			.then(($text) => {
				cy.wrap($text).should("contain.text","install-application");
				cy.wrap($text).should("contain.text","install-chaos-experiments");
				cy.wrap($text).should("contain.text","pod-network-loss");
				cy.wrap($text).should("contain.text","revert-chaos");
				cy.wrap($text).should("contain.text","delete-application");
			});
	});

	it("Checking Schedules Table for scheduled Workflow", () => {
		cy.GraphqlWait("workflowListDetails", "listSchedules");
		cy.visit("/workflows");
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

	it("Validate Verdict, Resilience score and Experiments Passed", () => {
		cy.validateVerdict(workflowName, "Self-Agent", "Failed", 0, 0, 1);
	});
});
