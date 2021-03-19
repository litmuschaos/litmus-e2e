/// <reference types="Cypress" />
import * as workflows from "../../../fixtures/Workflows.json";
import * as user from "../../../fixtures/Users.json";

describe("Testing the create Workflow Utility", () => {
  before("Clearing the Cookies and deleting the ", () => {
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.wait(8000); // Needs to be removed after frontend is fixed.
  });

  it("Checking the accessibility of the choose-cluster page", () => {
    // cy.waitForSelfCluster();
    cy.visit("/create-workflow");
    cy.url().should("contain", "/create-workflow");
    cy.contains("Choose the target Kubernetes Agent").should("be.visible");
    cy.get("[data-cy=AgentsDropDown]").should("be.visible");
    cy.get("[data-cy=SelectAndContinueButton] Button").should("be.disabled");
  });

  it("Checking choose cluster screen functionality", () => {
    cy.get("[data-cy=AgentsDropDown]").click();
    cy.get("[data-cy=Agents]").eq(0).click(); //Selecting Self Cluster from DropDown
    cy.get("[data-cy=SelectAndContinueButton] Button").should("be.enabled");
    cy.get("[data-cy=SelectAndContinueButton] Button").click();
    cy.url().should("contain", "/create-workflow");
    cy.contains("Select or design workflow").should("be.visible");
  });

  it("Checking Choose Workflow screen", () => {
    cy.get("[data-cy=PredefinedWorkflowsPanel]").should("be.visible");
    cy.get("[data-cy=CustomWorkflowCard]").should("be.visible");
    cy.get("[data-cy=StepperButtons]").should("be.visible");
    cy.get("[data-cy=StepperButtons]").children().eq(1).should("be.disabled");
    cy.get("[data-cy=StepperButtons]").children().eq(0).should("be.enabled");
    cy.get("[data-cy=PredefinedWorkflowsPanel]").children().eq(1).click();
    cy.get("[data-cy=EditWorkflowButton]").click();
    cy.get("[data-cy=WorkflowNameInput] input")
      .click()
      .clear()
      .type(workflows.nonRecurringworkflowName);
    cy.get("[data-cy=WorkflowDescriptionInput] textarea")
      .click()
      .clear()
      .type(workflows.nonRecurringworkflowDescription);
    cy.get("[data-cy=WorkflowDetailsModalButtons").children().eq(1).click();
    cy.get("[data-cy=StepperButtons]").children().eq(1).should("be.enabled");
    cy.get("[data-cy=StepperButtons]").children().eq(1).click();
    // cy.contains("Tune the selected workflow").scrollIntoView().should("be.visible"); //Not able to come in View
  });

  it("Checking the workflow Editor Page", () => {
    cy.get("[data-cy=WorkflowEditor]").should("be.visible");
    cy.get("[data-cy=StepperButtons]").scrollIntoView().should("be.visible");
    cy.get("[data-cy=StepperButtons]")
      .scrollIntoView()
      .children()
      .eq(1)
      .click();
  });

  it("Checking the resiliency score page", () => {
    cy.contains("Adjust the weights of the experiments in the workflow").should(
      "be.visible"
    );
    cy.get("[data-cy=ExperimentWeightSlider]").should("be.visible");

    // Code for Slider Manipulation
    cy.get("[data-cy=WeightSlider]").invoke("val", 5).trigger("change").click();
    cy.get("[data-cy=ExperimentWeight]").should("have.text", "5 points");
    cy.get("[data-cy=StepperButtons]").should("be.visible");
    cy.get("[data-cy=StepperButtons]").children().eq(1).click();
  });

  it("Checking the Scheduling options page", () => {
    cy.contains("Choose a chaos schedule").should("be.visible");
    cy.get("[data-cy=ScheduleOptions]").should("be.visible");
    cy.get("[data-cy=ScheduleOptions] :checked")
      .should("be.checked")
      .should("have.value", "now");
    cy.get("[data-cy=StepperButtons]").should("be.visible");
    cy.get("[data-cy=StepperButtons]").children().eq(1).click();
  });

  it("Checking Verify Screen", () => {
    cy.contains("Confirmation of Results").should("be.visible");
    console.log(cy.get("[data-cy=WorkflowName]"));
    cy.get("[data-cy=StepperButtons]").children().eq(1).click();
    cy.get("[data-cy=FinishModal]").should("be.visible");
    cy.get("[data-cy=GoToWorkflowButton]").click();
  });

  it("Checking Workflow Browsing Table for scheduled workflow", () => {
    cy.get("[data-cy=WorkflowRunsTable]", { timeout: 30000 }).should(
      "be.visible"
    );
    cy.get("[data-cy=WorkflowRunsTableRow]")
      .eq(0)
      .children()
      .eq(0)
      .should("have.text", "Running");
    cy.get("[data-cy=WorkflowRunsTableRow]")
      .eq(0)
      .children()
      .eq(1)
      .should("have.text", workflows.nonRecurringworkflowName);
    cy.get("[data-cy=WorkflowRunsTableRow]")
      .eq(0)
      .children()
      .eq(2)
      .should("have.text", "Self-Cluster");
  });

  it("Checking Schedules Table for scheduled Workflow", () => {
    cy.get("[data-cy=browseSchedule]").click();
    cy.get("[data-cy=workflowSchedulesTable]").should("be.visible");
    cy.get("[data-cy=workflowSchedulesTableRow]")
      .eq(0)
      .children()
      .eq(0)
      .should("have.text", workflows.nonRecurringworkflowName);
    cy.get("[data-cy=workflowSchedulesTableRow]")
      .eq(0)
      .children()
      .eq(2)
      .should("have.text", "Once");
    cy.get("[data-cy=workflowSchedulesTableRow]")
      .eq(0)
      .children()
      .eq(3)
      .should("have.text", "Self-Cluster");
  });
});
