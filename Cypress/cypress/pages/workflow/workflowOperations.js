//// ******************* Choose Agent Page ********************************

Cypress.Commands.add("chooseAgent", (Agent) => {
  cy.get(`[data-cy=${Agent}] input`).check();
  cy.get(`[data-cy=${Agent}] input`).should("be.checked");
});

//// *******************Choose Workflow Page *****************************

Cypress.Commands.add(
  "chooseWorkflow",
  (option, subOption, sampleYAML = "sample-workflow.yaml") => {
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
      cy.get("[data-cy=uploadYAMLInput] input").attachFile(sampleYAML);
    }
  }
);

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

//// ************************** Validate Experiment ********************

Cypress.Commands.add("validateExperiment", (experimentArray) => {
  experimentArray.forEach((experiment, index) => {
    cy.get("table")
      .find("tr")
      .eq(index + 1)
      .then(($div) => {
        cy.wrap($div)
          .find("td")
          .eq(1)
          .should("have.text", experiment.targetAppNS);
        cy.wrap($div).find("td").eq(2).should("have.text", experiment.label);
        cy.wrap($div)
          .find("td")
          .eq(0)
          .should("have.text", experiment.experimentName); // Matching Experiment
      });
  });
});

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

Cypress.Commands.add("selectSchedule", (option, subOption, min = 0) => {
  cy.get("[data-cy=ScheduleOptions]").should("be.visible");
  cy.get("[type=radio]").eq(option).check();

  if (option === 1) {
    cy.get("[data-cy=RecurringSchedule] :radio").eq(subOption).check();
    cy.get("[data-cy=RecurringSelect]").click();
    cy.get(`[data-cy=${min}]`).click();
  }
});

/// ************************** Download workflow manifest ***********

Cypress.Commands.add("downloadWorkflowManifest", (workflowName) => {
  cy.get("[data-cy=browseScheduleOptions]")
    .eq(0)
    .click({ scrollBehavior: false });
  cy.get("[data-cy=downloadManifest]")
    .eq(0)
    .should("have.text", "Download Manifest")
    .click({ force: true });
  cy.readFile(`./cypress/downloads/${workflowName}.yaml`);
  cy.task("deleteFolder", "./cypress/downloads");
});

/// ************************** Edit workflow schedule ***********

Cypress.Commands.add("editScheduleByMins", (minsToSet) => {
  cy.get("[data-cy=browseScheduleOptions]")
    .eq(0)
    .click({ scrollBehavior: false });
  cy.get("[data-cy=editSchedule]")
    .eq(0)
    .should("have.text", "Edit Schedule")
    .click({ force: true });
  cy.get("[data-cy=edit]").click();
  cy.get("[data-cy=RecurringSchedule] :radio").eq(0).check();
  cy.get("[data-cy=RecurringSelect]").click();
  cy.get(`[data-cy=${minsToSet}]`).click();
  cy.get("[data-cy=VerifyButton]").click();
});

/// ************************** Disable schedule ***********

Cypress.Commands.add("disableSchedule", () => {
  cy.get("[data-cy=browseScheduleOptions]")
    .eq(0)
    .click({ scrollBehavior: false });
  cy.get("[data-cy=disableSchedule]")
    .eq(0)
    .should("have.text", "Disable Schedule")
    .click({ force: true });
});

/// ************************** Enable schedule ***********

Cypress.Commands.add("enableSchedule", () => {
  cy.get("[data-cy=browseScheduleOptions]")
    .eq(0)
    .click({ scrollBehavior: false });
  cy.get("[data-cy=enableSchedule]")
    .eq(0)
    .should("have.text", "Enable Schedule")
    .click({ force: true });
});

/// ************************** Delete schedule ***********

Cypress.Commands.add("deleteSchedule", () => {
  cy.get("[data-cy=browseScheduleOptions]")
    .eq(0)
    .click({ scrollBehavior: false });
  cy.get("[data-cy=deleteSchedule]")
    .eq(0)
    .should("have.text", "Delete Schedule")
    .click({ force: true });
  cy.get("[data-cy=deleteScheduleButtons] button").eq(1).click();
});

/// ************************** Terminate Chaos Scenario ***********

Cypress.Commands.add("terminateWorkflow", () => {
  cy.get("[data-cy=browseWorkflowOptions]")
    .eq(0)
    .click({ scrollBehavior: false });
  cy.get("[data-cy=terminateWorkflow]")
    .eq(0)
    .should("have.text", "Terminate Chaos Scenario")
    .click({ force: true });
});

/// ************************** Rerun workflow ***********

Cypress.Commands.add("rerunWorkflow", () => {
  cy.get("[data-cy=browseScheduleOptions]")
    .eq(0)
    .click({ scrollBehavior: false });
  cy.get("[data-cy=reRunSchedule]")
    .eq(0)
    .should("have.text", "Rerun Schedule")
    .click();
});
