/// <reference types="Cypress" />
import * as workflows from "../../../fixtures/Workflows.json";
import * as user from "../../../fixtures/Users.json";

describe("Testing the upload Workflow with correct workflow manifest and target application", () => {
  before("Clearing the Cookies and deleting the Cookies", () => {
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.waitForCluster("Self-Agent");
    cy.visit("/create-workflow");
  });

  let workflowName = '';
  let workflowNamespace = '';

  it("Running Workflows by uploading it", () => {
    cy.chooseAgent(0);
    cy.get("[data-cy=ControlButtons] Button").eq(0).click();
    cy.chooseWorkflow(3, "");
    cy.wait(500);
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.wait(1000); // Waiting for Workflow Details to get filled
    cy.get("[data-cy=WorkflowNamespace] input").then(($namespace) => {
			workflowNamespace = $namespace.val();
			return;
		});
    cy.configureWorkflowSettings(
      workflows.nonRecurringworkflowName,
      workflows.nonRecurringworkflowDescription,
      0
    );
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.wait(1000); // Needs to be removed with frontend enhancement
    cy.get("[data-cy=addExperimentSearch]").should("not.exist");
    cy.get("table")
			.find("tr")
			.eq(1)
			.then(($div) => {
				cy.wrap($div)
					.find("td")
					.eq(0)
					.should("contain.text", "podtato-main-pod-delete-chaos"); // Matching Experiment
			});
		// Expected nodes
		const graphNodesNameArray = ["install-application", "install-chaos-experiments", "pod-delete", "revert-chaos", "delete-application"];
		// Verify nodes in dagre graph
		cy.validateGraphNodes(graphNodesNameArray);
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
          .should("have.text", workflowName); // Matching Workflow Name Regex
        cy.wrap($div).find("td").eq(3).should("have.text", "Self-Agent"); // Matching Target Agent
        // cy.wrap($div).find("td [data-cy=browseWorkflowOptions]").click(); // Clicking on 3 Dots
        // cy.get("[data-cy=workflowDetails]").eq(0).click(); // Checking Workflow Graph And Other Details
        cy.wrap($div).find("td").eq(2).click({ scrollBehavior: false });
      });
      cy.get("[data-cy=statsTabs]").find('button').eq(1).click();
      cy.get("[data-cy=workflowNamespace]").should("have.text", workflowNamespace);
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
      const graphNodesNameArray = [workflowName, "install-application", "install-chaos-experiments", "pod-delete", "revert-chaos", "delete-application"];
      // Verify nodes in dagre graph (TODO: Check status of nodes)
      cy.validateGraphNodes(graphNodesNameArray);
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
      });
  });
  
	it("Validate Verdict, Resilience score and Experiments Passed", () => {
		cy.validateVerdict(workflowName, "Self-Agent", "Succeeded", 100, 1, 1);
	});
});

describe("Testing the upload Workflow with incorrect workflow manifest", () => {
  before("Clearing the Cookies and deleting the Cookies", () => {
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.waitForCluster("Self-Agent");
    cy.visit("/create-workflow");
  });

  it("Running Workflows by uploading it", () => {
    cy.chooseAgent(0);
    cy.get("[data-cy=ControlButtons] Button").eq(0).click();
    cy.chooseWorkflow(3, "", "sample-workflow-incorrect.yaml");
    cy.get("[data-cy=ErrorUploadYAML]").should("have.text", "Retry Upload");
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.get("[data-cy=AlertBox]").should("have.text", "Please select a workflow type")
  });
});
