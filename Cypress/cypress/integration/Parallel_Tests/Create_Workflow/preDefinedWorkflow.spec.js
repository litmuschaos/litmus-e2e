/// <reference types="Cypress" />
import * as user from "../../../fixtures/Users.json";
import * as workflows from "../../../fixtures/Workflows.json";

export const workflowNamespace = Cypress.env("AGENT_NAMESPACE");
export const agent = Cypress.env("AGENT");
export const targetAppNamespace = Cypress.env("TARGET_APP_NS");

describe("Testing the workflow creation wizard using PreDefined Experiments", () => {
  before("Clearing the Cookies and deleting the Cookies", () => {
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.waitForCluster(agent);
    cy.visit("/create-workflow");
  });

  let workflowName = "";

  it("Running PreDefined Workflow", () => {
    cy.chooseAgent(agent);
    cy.GraphqlWait("listPredefinedWorkflows", "getPredefinedData");
    cy.get("[data-cy=ControlButtons] Button").eq(0).click();

    cy.wait("@getPredefinedData");
    cy.chooseWorkflow(0, 0);

    cy.get("[data-cy=WorkflowNamespace] input").should(
      "have.value",
      workflowNamespace
    );
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
    cy.get("[data-cy=addExperimentSearch]").should("not.exist");
        // Need other logic for checking engineNames now (Table shows chaosegines now)
    // const experimentArray = [
    //   {
    //     targetAppNS: workflowNamespace,
    //     label: "name=podtato-main",
    //     experimentName: "podtato-main-pod-delete-chaos",
    //   },
    // ];
    // cy.validateExperiment(experimentArray);
    cy.get("table").find("tr").eq(1).find("td").eq(0).click();
    const workflowParameters = {
      general: {
        context: `podtato-main-pod-delete-chaos_${workflowNamespace}`,
      },
      targetApp: {
        annotationCheckToggle: false,
        appns: targetAppNamespace,
        appKind: "deployment",
        appLabel: "name=podtato-main",
      },
      steadyState: {},
      tuneExperiment: {
        totalChaosDuration: 30,
        chaosInterval: 10,
        force: "false",
      },
    };
    cy.validatePredefinedWorkflowParameters(workflowParameters);
    // Expected nodes
    const graphNodesNameArray = [
      "install-application",
      "install-chaos-experiments",
      "pod-delete",
      "revert-chaos",
      "delete-application",
    ];
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

  it("Validating workflow existence and status on cluster", () => {
    // shouldExist = true
    cy.validateWorkflowExistence(workflowName, workflowNamespace, true);
    cy.validateWorkflowStatus(workflowName, workflowNamespace, ["Running"]);
  });

  it("Checking Schedules Table for scheduled Workflow", () => {
    cy.GraphqlWait("listWorkflows", "listSchedules");
    cy.visit("/workflows");
    cy.get("[data-cy=browseSchedule]").click();
    cy.wait("@listSchedules").its("response.statusCode").should("eq", 200);
    cy.get("[data-cy=workflowSchedulesTable] input")
      .eq(0)
      .clear()
      .type(workflowName);
    cy.wait(1000);
    cy.get("table")
      .find("tr")
      .eq(1)
      .then(($div) => {
        cy.wrap($div).find("td").eq(0).should("have.text", workflowName); // Matching Workflow Name Regex
        cy.wrap($div).find("td").eq(1).should("have.text", agent); // Matching Target Agent
      });
  });

  it("Checking workflow browsing table and validating Verdict, Resilience score and Experiments Passed", () => {
    let Experiments = [
      {
        name: "podtato-main-pod-delete-chaos",
        weight: 5,
      },
    ];
    cy.validateVerdict(
      workflowName,
      agent,
      "Succeeded",
      100,
      1,
      1,
      Experiments
    );
  });

  it("Validating graph nodes", () => {
    cy.GraphqlWait("listWorkflows", "listSchedules");
    cy.visit("/workflows");
    cy.wait("@listSchedules").its("response.statusCode").should("eq", 200);
    cy.validateWorkflowStatus(workflowName, workflowNamespace, [
      "Running",
      "Succeeded",
    ]);
    cy.get("[data-cy=WorkflowRunsTable] input")
      .eq(0)
      .clear()
      .type(workflowName);
    cy.wait(1000);
    cy.get("table")
      .find("tr")
      .eq(1)
      .find("td")
      .eq(2)
      .click({ scrollBehavior: false });
    cy.get("[data-cy=statsTabs]").find("button").eq(0).click();
    // Expected Nodes
    const graphNodesNameArray = [
      workflowName,
      "install-application",
      "install-chaos-experiments",
      "pod-delete",
      "revert-chaos",
      "delete-application",
    ];
    // Verify nodes in dagre graph (TODO: Check status of nodes)
    cy.validateGraphNodes(graphNodesNameArray);
  });
});
