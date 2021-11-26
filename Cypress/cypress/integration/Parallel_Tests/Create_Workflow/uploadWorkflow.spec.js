/// <reference types="Cypress" />
import * as workflows from "../../../fixtures/Workflows.json";
import * as user from "../../../fixtures/Users.json";

export const workflowNamespace = Cypress.env("AGENT_NAMESPACE");
export const agent = Cypress.env("AGENT");
export const targetAppNamespace = Cypress.env("TARGET_APP_NS");

describe("Testing the upload Workflow with correct workflow manifest and target application", () => {
  before("Clearing the Cookies and deleting the Cookies", () => {
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.waitForCluster(agent);
    cy.visit("/create-workflow");
  });

  let workflowName = '';
  let workflowSubject = '';

  it("Creating a target application", () => {
		cy.createTargetApplication(targetAppNamespace, "target-app-1", "nginx");
	});

  it("Running Workflows by uploading it", () => {
		cy.chooseAgent(agent);
    cy.get("[data-cy=ControlButtons] Button").eq(0).click();
    cy.chooseWorkflow(3, "", `sample-workflow-${workflowNamespace}.yaml`);
    cy.wait(500);
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.wait(1000); // Waiting for Workflow Details to get filled
    cy.get("[data-cy=WorkflowNamespace] input")
      .should("have.value", workflowNamespace);
    // cy.configureWorkflowSettings(
    //   workflows.nonRecurringworkflowName,
    //   workflows.nonRecurringworkflowDescription,
    //   0
    // );
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    // cy.wait(1000); // Needs to be removed with frontend enhancement
    // cy.get("[data-cy=addExperimentSearch]").should("not.exist");
    // cy.get("table")
		// 	.find("tr")
		// 	.eq(1)
		// 	.then(($div) => {
		// 		cy.wrap($div)
		// 			.find("td")
		// 			.eq(0)
		// 			.should("contain.text", "podtato-main-pod-delete-chaos"); // Matching Experiment
		// 	});
		// // Expected nodes
		// const graphNodesNameArray = ["install-application", "install-chaos-experiments", "pod-delete", "revert-chaos", "delete-application"];
		// // Verify nodes in dagre graph
		// cy.validateGraphNodes(graphNodesNameArray);
    // cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    // cy.rScoreEditor(5);
    // cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.selectSchedule(0);
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    // cy.verifyDetails(
    //   workflows.nonRecurringworkflowName,
    //   workflows.nonRecurringworkflowDescription,
    //   0
    // );
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

  it("Validating workflow existence and status on cluster", () => {
    // shouldExist = true
		cy.validateWorkflowExistence(workflowName, workflowNamespace, true);
		cy.validateWorkflowStatus(workflowName, workflowNamespace, ["Running"]);
	});

  it("Checking Schedules Table for scheduled Workflow", () => {
		cy.GraphqlWait("workflowListDetails", "listSchedules");
		cy.visit("/workflows");
		cy.get("[data-cy=browseSchedule]").click();
		cy.wait("@listSchedules").its("response.statusCode").should("eq", 200);
		cy.get("[data-cy=workflowSchedulesTable] input").eq(0).clear().type(workflowName);
		cy.wait(1000);
		cy.get("table")
			.find("tr")
			.eq(1)
			.then(($div) => {
				cy.wrap($div)
					.find("td")
					.eq(0)
					.should("have.text", workflowName); // Matching Workflow Name Regex
				cy.wrap($div).find("td").eq(1).should("have.text", agent); // Matching Target Agent
			});
	});

	it("Checking workflow browsing table and validating Verdict, Resilience score and Experiments Passed", () => {
		cy.validateVerdict(workflowName, agent, "Succeeded", 100, 1, 1);
	});

	it("Validating graph nodes", () => {
		cy.validateWorkflowStatus(workflowName, workflowNamespace, ["Running", "Succeeded"]);
		cy.get("table")
			.find("tr")
			.eq(2)
			.find('td')
			.eq(2)
			.click({ scrollBehavior: false });
		cy.get("[data-cy=statsTabs]").find('button').eq(0).click();
		// Expected Nodes
		const graphNodesNameArray = [workflowName, "install-chaos-experiments", "pod-delete", "revert-chaos"];
		// Verify nodes in dagre graph (TODO: Check status of nodes)
		cy.validateGraphNodes(graphNodesNameArray);
	});

  it("Deleting the target application", () => {
		cy.deleteTargetApplication(targetAppNamespace, "target-app-1");
	});

  it("Testing the workflow statistics", () => {
		cy.GraphqlWait("workflowListDetails", "recentRuns");
		cy.visit("/observability");
		cy.get("[data-cy=litmusDashboard]").click();
		cy.wait("@recentRuns").its("response.statusCode").should("eq", 200);
		cy.get(`[data-cy=${workflowName}]`)
			.find("[data-cy=statsButton]")
			.click();
		cy.validateWorkflowInfo(workflowName, workflowNamespace, workflowSubject, agent, "Cron workflow", "Cron workflow");
		cy.validateStatsChart();
		const experimentArray = [
			{
				experimentName: "pod-delete",
				verdict: "Pass",
				weightOfTest: 10,
				resultingPoints: 10
			}
		];
		cy.validateExperimentsTable(experimentArray);
	});
});

describe("Testing the upload Workflow with incorrect workflow manifest", () => {
  before("Clearing the Cookies and deleting the Cookies", () => {
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.waitForCluster(agent);
    cy.visit("/create-workflow");
  });

  it("Running Workflows by uploading it", () => {
		cy.chooseAgent(agent);
    cy.get("[data-cy=ControlButtons] Button").eq(0).click();
    cy.chooseWorkflow(3, "", "sample-workflow-incorrect.yaml");
    cy.get("[data-cy=ErrorUploadYAML]").should("have.text", "Retry Upload");
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.get("[data-cy=AlertBox]").should("have.text", "Please select a workflow type")
  });
});
