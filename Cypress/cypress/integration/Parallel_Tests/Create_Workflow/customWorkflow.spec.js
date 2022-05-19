// <reference types="Cypress" />
import * as user from "../../../fixtures/Users.json";
import * as workflows from "../../../fixtures/Workflows.json";

export const workflowNamespace = Cypress.env("AGENT_NAMESPACE");
export const agent = Cypress.env("AGENT");
export const targetAppNamespace = Cypress.env("TARGET_APP_NS");

describe("Testing the validation of the final verdict with an existing target application by selecting experiments from chaoshub", () => {
  before("Loggin in and checking if agent exists", () => {
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.waitForCluster(agent);
    cy.visit("/create-workflow");
  });

  let workflowName = "";
  let workflowSubject = "";

  it("Creating a target application", () => {
    cy.createTargetApplication(targetAppNamespace, "target-app-1", "nginx");
  });

  it("Scheduling a workflow with an existing target application", () => {
    cy.chooseAgent(agent);
    cy.get("[data-cy=ControlButtons] Button").eq(0).click();
    cy.chooseWorkflow(2, 0);

    cy.get("[data-cy=WorkflowNamespace] input").should(
      "have.value",
      workflowNamespace
    );
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
    cy.get("[data-cy=addExperimentSearch]")
      .find("input")
      .clear()
      .type("generic");
    cy.get("[data-cy=ExperimentList] :radio").eq(0).check();
    cy.get("[data-cy=AddExperimentDoneButton]").click();
    /**
     * Waiting for the dagre animation to complete after closing the
     * add experiment modal
     */
    cy.wait(1000);
    // Need other logic for checking engineNames now (Table shows chaosegines now)
    // const experimentArray = [
    //   {
    //     targetAppNS: targetAppNamespace,
    //     label: "app=nginx",
    //     experimentName: "pod-delete",
    //   },
    // ];
    // cy.validateExperiment(experimentArray);
    cy.get("table").find("tr").eq(1).find("td").eq(0).click();
    const tunningParameters = {
      general: {
        hubName: "Litmus ChaosHub",
        experimentName: "pod-delete",
        context: `pod-delete_${workflowNamespace}`,
      },
      targetApp: {
        annotationCheckToggle: false,
        appns: "default",
        appKind: "deployment",
        appLabel: "app=nginx",
      },
      steadyState: {},
      tuneExperiment: {
        totalChaosDuration: 30,
        chaosInterval: 10,
        force: "false",
      },
    };
    cy.tuneCustomWorkflow(tunningParameters);
    cy.get("[data-cy=revertChaosSwitch] input").click();
    // Expected nodes
    const graphNodesNameArray = ["install-chaos-experiments", "pod-delete"];
    // Verify nodes in dagre graph
    cy.validateGraphNodes(graphNodesNameArray);
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
    cy.get("[data-cy=WorkflowSubject]").should(
      "have.text",
      `${workflows.customWorkflow}_${workflowNamespace}`
    );
    cy.get("[data-cy=WorkflowSubject] textarea")
      .eq(0)
      .clear()
      .type("custom-workflow-subject");
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
        name: "pod-delete",
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
      "install-chaos-experiments",
      "pod-delete",
    ];
    // Verify nodes in dagre graph (TODO: Check status of nodes)
    cy.validateGraphNodes(graphNodesNameArray);
  });

  it("Deleting the target application", () => {
    cy.deleteTargetApplication(targetAppNamespace, "target-app-1");
  });

  it("Testing the workflow statistics", () => {
    cy.GraphqlWait("listWorkflows", "recentRuns");
    cy.visit("/analytics");
    cy.get("[data-cy=litmusDashboard]").click();
    cy.wait("@recentRuns").its("response.statusCode").should("eq", 200);
    cy.get(`[data-cy=${workflowName}]`).find("[data-cy=statsButton]").click();
    cy.validateWorkflowInfo(
      workflowName,
      workflowNamespace,
      workflowSubject,
      agent,
      "Non cron workflow",
      "Non cron workflow"
    );
    cy.validateWorkflowStatsGraph(1, 0, 100, 100, 0);
    const experimentArray = [
      {
        experimentName: "pod-delete",
        verdict: "Pass",
        weightOfTest: 5,
        resultingPoints: 5,
      },
    ];
    cy.validateExperimentsTable(experimentArray);
  });

  // This will runs the above workflow without target application
  it("Rerun a non-recurring workflow", () => {
    cy.visit("/workflows");
    cy.get("[data-cy=browseSchedule]").click();
    cy.wait(2000);
    cy.get("table")
      .find("tr")
      .eq(1)
      .then(($div) => {
        cy.wrap($div).find("td").eq(5).should("have.text", "Non cron workflow");
      });
    cy.rerunWorkflow();
  });

  it("Checking workflow browsing table and validating Verdict, Resilience score and Experiments Passed", () => {
    let Experiments = [
      {
        name: "pod-delete",
        weight: 5,
      },
    ];
    cy.validateVerdict(workflowName, agent, "Failed", 0, 0, 1, Experiments);
  });

  it("Testing the workflow statistics", () => {
    cy.GraphqlWait("listWorkflows", "recentRuns");
    cy.visit("/analytics");
    cy.get("[data-cy=litmusDashboard]").click();
    cy.wait("@recentRuns").its("response.statusCode").should("eq", 200);
    cy.get(`[data-cy=${workflowName}]`).find("[data-cy=statsButton]").click();
    cy.validateWorkflowInfo(
      workflowName,
      workflowNamespace,
      workflowSubject,
      agent,
      "Non cron workflow",
      "Non cron workflow"
    );
    cy.validateWorkflowStatsGraph(1, 1, 50, 50, 50);
    cy.validateRecurringStatsWithLessResiliency();
  });
});
