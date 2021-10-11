// <reference types="Cypress" />
import * as user from "../../../fixtures/Users.json";
import * as workflows from "../../../fixtures/Workflows.json";
import * as targetApp from "../../../fixtures/TargetApplication.json";
import { apis, KUBE_API_TOKEN } from "../../../kube-apis/apis";

describe("Testing the validation of the final verdict without target application", () => {
	before("Loggin in and checking if agent exists", () => {
		cy.requestLogin(user.AdminName, user.AdminPassword);
		cy.waitForCluster("Self-Agent");
		cy.visit("/create-workflow");
	});

	let workflowName = '';

	it("Scheduling a workflow without target application", () => {
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
		// Matching nodes of dagre graph
		cy.get("[data-cy=DagreGraphSvg]")
			.find("text")
			.then(($text) => {
				cy.wrap($text).should("contain.text","install-chaos-experiments");
			});
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
		cy.get("[data-cy=TargetApplication]").find("input").eq(2).clear().type(targetApp.targetAppName);
		cy.get("[data-cy=TargetApplication] Button").eq(5).click();
		cy.get("[data-cy=SteadyState] Button").eq(2).click();
		cy.get("[data-cy=TuneExperiment] Button").eq(3).click();
		// Matching nodes of dagre graph
		cy.get("[data-cy=DagreGraphSvg]")
			.find("text")
			.then(($text) => {
				cy.wrap($text).should("contain.text","install-chaos-experiments");
				cy.wrap($text).should("contain.text","cassandra-pod-delete");
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
					.should("include.text", workflows.customWorkflow); // Matching Workflow Name Regex
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
					return $text.length >= 13 ? true : false;
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
				cy.wrap($text).should("contain.text","install-chaos-experiments");
				cy.wrap($text).should("contain.text","cassandra-pod-delete");
				cy.wrap($text).should("contain.text","revert-chaos");
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
					.should("include.text", workflows.customWorkflow); // Matching Workflow Name Regex
				cy.wrap($div).find("td").eq(1).should("have.text", "Self-Agent"); // Matching Target Agent
			});
	});

	it("Validate Verdict, Resilience score and Experiments Passed", () => {
		cy.validateVerdict(workflowName, "Self-Agent", "Failed", 0, 0, 1);
	});
});

describe("Testing the validation of the final verdict with an existing target application", () => {
	before("Loggin in and checking if agent exists", () => {
		cy.requestLogin(user.AdminName, user.AdminPassword);
		cy.waitForCluster("Self-Agent");
		cy.visit("/create-workflow");
	});

	let workflowName = '';

	it("Creating a target application", () => {
		cy.request({
			url: apis.createDeployment("default"),
			method: "POST",
			headers: {
			  Authorization: `Bearer ${KUBE_API_TOKEN}`,
			  'Content-Type': 'application/json'
			},
			body: targetApp.configDataForCreation
		  }).should((response) => {
			console.log(response);
		  });
	});

	it("Scheduling a workflow with an existing target application", () => {
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
		// Matching nodes of dagre graph
		cy.get("[data-cy=DagreGraphSvg]")
			.find("text")
			.then(($text) => {
				cy.wrap($text).should("contain.text","install-chaos-experiments");
			});
		/***
		 * Add an experiment containing pod text
		 */
		cy.get("[data-cy=addExperimentButton]").should("be.visible");
		cy.get("[data-cy=addExperimentButton]").click();
		/**
		 * Waiting for the search experiment field to be visible
		 */
		cy.get("[data-cy=addExperimentSearch]").should("be.visible");
		cy.get("[data-cy=addExperimentSearch]").find("input").clear().type("gen");
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
		cy.get("[data-cy=TargetApplication] Button").eq(5).click();
		cy.get("[data-cy=SteadyState] Button").eq(2).click();
		cy.get("[data-cy=TuneExperiment] Button").eq(3).click();
		// Matching nodes of dagre graph
		cy.get("[data-cy=DagreGraphSvg]")
			.find("text")
			.then(($text) => {
				cy.wrap($text).should("contain.text","install-chaos-experiments");
				cy.wrap($text).should("contain.text","pod-delete");
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
					.should("include.text", workflows.customWorkflow); // Matching Workflow Name Regex
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
					return $text.length >= 13 ? true : false;
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
				cy.wrap($text).should("contain.text","install-chaos-experiments");
				cy.wrap($text).should("contain.text","pod-delete");
				cy.wrap($text).should("contain.text","revert-chaos");
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
					.should("include.text", workflows.customWorkflow); // Matching Workflow Name Regex
				cy.wrap($div).find("td").eq(1).should("have.text", "Self-Agent"); // Matching Target Agent
			});
	});

	it("Validate Verdict, Resilience score and Experiments Passed", () => {
		cy.validateVerdict(workflowName, "Self-Agent", "Succeeded", 100, 1, 1);
	});

	it("Deleting the target application", () => {
		cy.request({
			url: apis.deleteDeployment("default", targetApp.targetAppName),
			method: "DELETE",
			headers: {
			  Authorization: `Bearer ${KUBE_API_TOKEN}`,
			  'Content-Type': 'application/json'
			},
			body: targetApp.configDataForDeletion
		  }).should((response) => {
			console.log(response);
		  });
	})
});