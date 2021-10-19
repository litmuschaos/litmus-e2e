// <reference types="Cypress" />
import * as user from "../../../fixtures/Users.json";
import * as workflows from "../../../fixtures/Workflows.json";

describe("Testing the workflow schedule on a recurring basis with a target application", () => {
	before("Loggin in and checking if agent exists", () => {
		cy.requestLogin(user.AdminName, user.AdminPassword);
		cy.waitForCluster("Self-Agent");
		cy.visit("/create-workflow");
	});

	let workflowName = '';

	it("Creating a target application", () => {
		cy.createTargetApplication("default", "target-app-1", "nginx");
	});

	it("Scheduling a workflow with an existing target application", () => {
		cy.chooseAgent(0);
		cy.get("[data-cy=ControlButtons] Button").eq(0).click();
		cy.chooseWorkflow(2, 0);

		// Provide the correct details
		cy.configureWorkflowSettings(
			workflows.customWorkflow,
			workflows.customWorkflowDescription,
			0
		);
		cy.get("[data-cy=ControlButtons] Button").eq(1).click();
		// Expected nodes
		const graphNodeNameArray = ["install-chaos-experiments"];
		// Verify nodes in dagre graph
		cy.validateGraphNodes(graphNodeNameArray);
		/***
		 * Add an experiment containing pod text
		 */
		cy.get("[data-cy=addExperimentButton]").should("be.visible");
		cy.get("[data-cy=addExperimentButton]").click();
		/**
		 * Waiting for the search experiment field to be visible
		 */
		cy.get("[data-cy=addExperimentSearch]").should("be.visible");
		cy.get("[data-cy=addExperimentSearch]").find("input").clear().type("generic");
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
					.should("contain.text", "pod-delete") // Matching Experiment
			});
		cy.wait(1000);
		// Expected nodes
		const graphNodesNameArray = ["install-chaos-experiments", "pod-delete"];
		// Verify nodes in dagre graph
		cy.validateGraphNodes(graphNodesNameArray);
		cy.get("[data-cy=ControlButtons] Button").eq(1).click();
		cy.rScoreEditor(5);
		cy.get("[data-cy=ControlButtons] Button").eq(1).click();
        // Minutes in current time
        const min = (new Date()).getMinutes();
        // Schedule one min later from current time
		cy.selectSchedule(1, 0, min+2);
		cy.get("[data-cy=ControlButtons] Button").eq(1).click();
		cy.verifyDetails(
			workflows.customWorkflow,
			workflows.customWorkflowDescription,
			1,
            min+2
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
					.should("have.text", workflowName); // Matching Workflow Name Regex
				cy.wrap($div).find("td").eq(1).should("have.text", "Self-Agent"); // Matching Target Agent
                cy.waitUntil(() => 
                    cy.wrap($div)
					    .find("td")
					    .eq(4)
					    .then((nextRun) => {
                            const date = new Date();
                            const hours = date.getHours()%12;
                            const mins = date.getMinutes();
                            return (nextRun.text().includes(`${hours}:${mins}`) ? true : false);
                        }),
                    {
                        verbose: true,
                        interval: 500,
                        timeout: 600000,
                    }
                );
            })
	});

	it("Checking Workflow Browsing Table for scheduled workflow", () => {
		cy.get("[data-cy=runs]").click();
		cy.wait(1000);
		cy.get("table")
			.find("tr")
			.eq(1)
			.then(($div) => {
				cy.wrap($div).find("td").eq(1).should("have.text", "Running"); // Matching Status
				cy.wrap($div)
					.find("td")
					.eq(2)
					.should("have.text", workflowName); // Matching Workflow Name Regex
				cy.wrap($div).find("td").eq(3).should("have.text", "Self-Agent"); // Matching Target Agent
				// Workflow Statistics (Graph View)
				cy.wrap($div).find("td").eq(2)
				cy.wrap($div).find("td").eq(2).click({ scrollBehavior: false });
			});
		cy.get("[data-cy=statsTabs]").find('button').eq(1).click();
		cy.waitUntil(() =>
			cy.get("[data-cy=workflowStatus]").then((status) => {
				return status.text() !== "Running" ? true : false;
			}),
			{
				verbose: true,
				interval: 500,
				timeout: 600000,
			}
		);
		cy.get("[data-cy=statsTabs]").find('button').eq(0).click();
		// Expected Nodes
		const graphNodesNameArray = ["install-chaos-experiments", "pod-delete", "revert-chaos"];
		// Verify nodes in dagre graph (TODO: Check status of nodes)
		cy.validateGraphNodes(graphNodesNameArray);
	});

	it("Validate Verdict, Resilience score and Experiments Passed", () => {
		cy.validateVerdict(workflowName, "Self-Agent", "Succeeded", 100, 1, 1);
	});

	it("Deleting the target application", () => {
		cy.deleteTargetApplication("default", "target-app-1");
	})
});