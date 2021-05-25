/// Script Containing Custom functions for Workflow Scheduling Flow

//// ******************* Choose Agent Page ********************************

Cypress.Commands.add("chooseAgent", (Agent) => {
  cy.get('[type="radio"]').eq(Agent).check();
});

//// *******************Choose Workflow Page *****************************

Cypress.Commands.add("chooseWorkflow", (option, subOption) => {
  cy.get("[data-cy=WorkflowsRadioGroup]").should("be.visible");
  if (option == 0) {
    cy.get("[data-cy=PredefinedWorkflowsRadioButton] :radio").check();
    cy.get("[data-cy=PredefinedWorkflowsRadioGroup]").should("be.visible");
    cy.get("[data-cy=PredefinedWorkflowsRadioGroup]")
      .children()
      .eq(subOption)
      .within(() => {
        cy.get("[type=radio]").check();
      });
  } else if (option == 1) {
    cy.get("[data-cy=templateWorkflowsRadioButton] :radio").check();
    cy.get("[data-cy=templateWorkflowsRadioGroup]").should("be.visible");
    cy.get("[data-cy=templateWorkflowsRadioGroup]")
      .children()
      .eq(subOption)
      .within(() => {
        cy.get("[type=radio]").check();
      });
  } else if (option == 2) {
    cy.get("[data-cy=myHubsRadioButton] :radio").check();
    cy.get("[data-cy=myHubDropDown]").click();
    cy.get("[data-cy=hubOption]").eq(subOption).click();
  } else if (option == 3) {
    cy.get("[data-cy=uploadYAMLRadioButton] :radio").check();
    cy.get("[data-cy=uploadYAMLInput]").should("be.visible");
    cy.get("[data-cy=uploadYAMLInput] input").attachFile(
      "sample-workflow.yaml"
    );
  }
});

//// ************************** Workflow Settings Page ********************

Cypress.Commands.add(
  "configureWorkflowSettings",
  (name, description, option) => {
    cy.get("[data-cy=WorkflowName] input").clear().type(name); //Inputting Workflow name
    // cy.get("[data-cy=WorkflowNamespace] input").should("be.disabled"); // checking namespace input to be disabled
    cy.get("[data-cy=WorkflowDescription]").clear().type(description); // Inputting discription
  }
);

//// ************************* Workflow Tunning Page **********************

Cypress.Commands.add("tuneWorkflow", (option) => {});

//// ************************* R-Score Manipulation ***********************
Cypress.Commands.add("rScoreEditor", (value) => {
  cy.wait(1000);
  cy.get("[data-cy=WeightSlider]")
    .eq(0)
    .invoke("val", value)
    .trigger("change")
    .click();
  cy.get("[data-cy=ExperimentWeight]")
    .eq(0)
    .should("have.text", value + " points");
});

/// ************************** Workflow Schedule Selection Page ***********

Cypress.Commands.add("selectSchedule", (option) => {
  cy.get("[data-cy=ScheduleOptions]").should("be.visible");
  cy.get("[type=radio]").eq(option).check();
});

/// ************************** Verify and Commit Page **********************

Cypress.Commands.add("verifyDetails", (name, description, schedule) => {
  cy.get("[data-cy=WorkflowName]").should("include.text", name); // Name validation
  cy.get("[data-cy=WorkflowDescription]").should("have.text", description); // Description Validation
  if (schedule == 0)
    cy.get("[data-cy=schedule]").should("have.text", "Scheduling now"); // Schedule Validation
  cy.get("[data-cy=AgentName]").should("have.text", "Self-Agent");
});
