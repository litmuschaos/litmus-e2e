import "cypress-wait-until";
/// Script Containing Custom functions for Workflow Scheduling Flow

//// ******************* Choose Agent Page ********************************

Cypress.Commands.add("chooseAgent", (Agent) => {
  cy.get('[type="radio"]').eq(Agent).check();
  cy.get('[type="radio"]').eq(Agent).should("be.checked");
});

//// *******************Choose Workflow Page *****************************

Cypress.Commands.add("chooseWorkflow", (option, subOption) => {
  cy.get("[data-cy=WorkflowsRadioGroup]").should("be.visible");

  if (option == 0) {
    cy.wait(180);
    cy.get("[data-cy=PredefinedWorkflowsRadioButton] :radio").check();
    cy.get("[data-cy=PredefinedWorkflowsRadioButton] :radio").should(
      "be.checked"
    );
    cy.get("[data-cy=selectPreDefinedMyHub]").within(() => {
      cy.get("[data-cy=PreDefinedHubOption]")
        .contains("Litmus ChaosHub")
        .should("be.visible");
    });
    cy.get("[data-cy=PredefinedWorkflowsRadioGroup]").should("be.visible");
    cy.get("[data-cy=PredefinedWorkflowsRadioGroup]")
      .children()
      .eq(subOption)
      .within(() => {
        cy.get("[type=radio]").check();
        cy.get("[type=radio]").should("be.checked");
      });
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
  } else if (option == 1) {
    cy.get("[data-cy=templateWorkflowsRadioButton] :radio").check();
    cy.get("[data-cy=templateWorkflowsRadioButton] :radio").should(
      "be.checked"
    );
    cy.get("[data-cy=templateWorkflowsRadioGroup]")
      .children()
      .eq(subOption)
      .within(() => {
        cy.get("[type=radio]").click();
      });
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
  } else if (option == 2) {
    cy.get("[data-cy=myHubsRadioButton] :radio").check();
    cy.get("[data-cy=myHubDropDown]").click();
    cy.get("[data-cy=hubOption]").eq(subOption).click();
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
  } else if (option == 3) {
    cy.get("[data-cy=uploadYAMLRadioButton] :radio").check();
    cy.get("[data-cy=uploadYAMLRadioButton] :radio").should("be.checked");
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
    cy.wait(1000);
    cy.get("[data-cy=WorkflowName] input").clear().type(name); //Inputting Workflow name
    // cy.get("[data-cy=WorkflowNamespace] input").should("be.disabled"); // checking namespace input to be disabled
    cy.get("[data-cy=WorkflowDescription]").clear().type(description); // Inputting discription
  }
);

//// ************************* Workflow Tunning Page **********************

Cypress.Commands.add("tuneWorkflow", (option) => { });

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

Cypress.Commands.add("selectSchedule", (option, subOption) => {
  cy.get("[data-cy=ScheduleOptions]").should("be.visible");
  cy.get("[type=radio]").eq(option).check();

  if (option === 1)
    cy.get("[data-cy=RecurringSchedule] :radio").eq(subOption).check();
});

/// ************************** Verify and Commit Page **********************

Cypress.Commands.add("verifyDetails", (name, description, schedule) => {
  cy.get("[data-cy=WorkflowName]").should("include.text", name); // Name validation
  cy.get("[data-cy=WorkflowDescription]").should("have.text", description); // Description Validation
  if (schedule == 0)
    cy.get("[data-cy=schedule]").should("have.text", "Scheduling now"); // Schedule Validation
  // cy.get("[data-cy=AgentName]").should("have.text", "Self-Agent");
});

/// ************************** Validate verdict of given workflow and agent **********************

Cypress.Commands.add("validateVerdict", (workflowName, agentName, expectedVerdict) => {
  cy.visit("/workflows");
  cy.GraphqlWait("workflowListDetails", "listSchedules");
  cy.get("[data-cy=runs]").click();
  cy.wait("@listSchedules").its("response.statusCode").should("eq", 200);
  cy.wait(1000);
  // Search for given workflowName in the table and click on it
  cy.get("table")
    .find("[data-cy=workflowName]")
    .each(($p) => {
      if ($p.text() === workflowName) {
        $p.click();
        return false;
      }
    });
  cy.wait(1000);
  // Clicks on table view
  cy.get('[tabindex=-1]').click();
  cy.wait(1000);
  // Wait for turning Running status into any Verdict
  cy.waitUntil(() => 
    cy.get("[data-cy=workflowStatus]")
      .then(($div) => {
        return $div.text() != "Running" ? true : false;
      }),
    {
      verbose: true,
      interval: 500,
      timeout: 600000,
    }
  );
  // Verify with expected Verdict
  cy.get("[data-cy=workflowStatus]").should("contain.text", expectedVerdict); 
});