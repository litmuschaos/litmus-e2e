/// <reference types="Cypress" />
import * as user from "../../../fixtures/Users.json";
import workflows from "../../../fixtures/Workflows.json";

describe("Testing the create Workflow Utility", () => {
  before("Clearing the Cookies and deleting the Cookies", () => {
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.waitForCluster("Self-Agent");
    cy.visit("/create-workflow");
  });

  it("Running Predefined Workflows with predefined configurations", () => {
    cy.chooseAgent(0);
    cy.get("[data-cy=ControlButtons] Button").eq(0).click();
    cy.chooseWorkflow(0, 1);
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.wait(500); // Waiting for Workflow Details to get filled
    cy.configureWorkflowSettings(
      workflows.nonRecurringworkflowName,
      workflows.nonRecurringworkflowDescription,
      0
    );
    cy.GraphqlWait(
      "GetPredefinedExperimentYAML",
      "PredefinedExperimentYAMLWait"
    );
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.wait("@PredefinedExperimentYAMLWait");
    cy.wait(1000);
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
        // cy.wrap($div).find("td [data-cy=browseWorkflowOptions]").click(); // Clicking on 3 Dots
        // cy.get("[data-cy=workflowDetails]").eq(0).click(); // Checking Workflow Graph And Other Details
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
          .should("include.text", workflows.nonRecurringworkflowName); // Matching Workflow Name Regex
        cy.wrap($div).find("td").eq(1).should("have.text", "Self-Agent"); // Matching Target Agent
      });
  });

  it("Construct a Parallel Workflow", () => {
    cy.visit("/create-workflow");
    cy.chooseAgent(0);
    cy.get("[data-cy=ControlButtons] Button").eq(0).click();
    cy.chooseWorkflow(2, 0);
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
    cy.get("[data-cy=addExperimentSearch]")
      .find("input")
      .clear()
      .type("pod-delete");
    cy.get("[data-cy=ExperimentList] :radio").eq(1).check();
    cy.get("[data-cy=AddExperimentDoneButton]").click();
    cy.wait(1000);

    cy.get("[data-cy=addExperimentButton]").should("be.visible");
    cy.get("[data-cy=addExperimentButton]").click();
    cy.get("[data-cy=addExperimentSearch]")
      .find("input")
      .clear()
      .type("pod-delete");
    cy.get("[data-cy=ExperimentList] :radio").eq(2).check();
    cy.get("[data-cy=AddExperimentDoneButton]").click();
    cy.wait(1000);

    cy.get("[data-cy=EditSequenceButton]").click();
    // cy.wait(2000);
    // cy.get("[data-rbd-draggable-id=pod-delete]")
    //   .drag("[data-rbd-draggable-id=coredns-pod-delete]", {force: true});

    // To Be Implemented
  });

  it("Check the Workflow Visualization", () => {
    cy.GraphqlWait("workflowDetails", "listWorkflows");
    cy.visit("/workflows");
    cy.get("[data-cy=runs]").click();
    cy.wait("@listWorkflows").its("response.statusCode").should("eq", 200);
    // Clicking on first workflow in table as it is latest one
    cy.get("[data-cy=workflowName]").eq(0).click({ force: true });
    cy.get("[data-cy=dagreGraphWorkflowLevel]").should("be.visible");
    // This needs other logic
    // cy.get(".ChaosEngine").should("be.visible");
    // cy.get(".ChaosEngine").click();
    // cy.get("[data-cy=LogsWindow]").should("be.visible");
    // cy.get("[role=tab]").eq(3).click();
    // cy.get("[data-cy=ChaosResultTypography]").should("not.be.empty");
    // cy.get("[role=tab]").eq(1).click();
    // cy.get("[data-cy=browseScheduleTable]").should("be.visible");
  });

  it("Create a recurring schedule and editing the Schedule", () => {
    cy.visit("/create-workflow");
    cy.chooseAgent(0);
    cy.get("[data-cy=ControlButtons] Button").eq(0).click();
    cy.chooseWorkflow(0, 0);
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.configureWorkflowSettings(
      workflows.recurringWorkflowName,
      workflows.recurringWorkflowDescription,
      1
    );
    cy.GraphqlWait(
      "GetPredefinedExperimentYAML",
      "PredefinedExperimentYAMLWait"
    );
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.wait("@PredefinedExperimentYAMLWait");
    cy.wait(1000);
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.rScoreEditor(5);
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.selectSchedule(1, 0);
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    cy.verifyDetails(
      workflows.recurringWorkflowName,
      workflows.recurringWorkflowDescription,
      1
    );
    cy.get("[data-cy=ControlButtons] Button").eq(0).click(); // Clicking on finish Button
    cy.get("[data-cy=FinishModal]").should("be.visible");
    cy.get("[data-cy=GoToWorkflowButton]").click();

    cy.GraphqlWait("workflowListDetails", "listSchedules");
    cy.get("[data-cy=browseSchedule]").click();
    cy.wait("@listSchedules").its("response.statusCode").should("eq", 200);
    cy.wait(1000);
    cy.get("[data-cy=editSchedule]").eq(0).click({ force: true });
    cy.get("[data-cy=edit]").click();
    cy.selectSchedule(1, 2);
    cy.get("[data-cy=VerifyButton]").click();
    cy.wait(500);
    cy.get("[data-cy=SaveEditScheduleButton]").click();
    cy.get("[data-cy=FinishModal]").should("be.visible");
    cy.get("[data-cy=selectFinish]").click();
  });
});
