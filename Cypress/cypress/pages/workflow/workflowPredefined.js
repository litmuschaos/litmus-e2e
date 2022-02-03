Cypress.Commands.add(
  "validatePredefinedWorkflowParameters",
  (workflowParameters) => {
    // const workflowParameters = {
    //   general : {
    //     context : "podtato-main-pod-delete-chaos_litmus"
    //   },
    //   targetApp : {
    //     annotationCheckToggle : false,
    //     appns : "litmus",
    //     appKind : "deployment",
    //     appLabel : "name=podtato-main"
    //   },
    //   steadyState : {},
    //   tuneExperiment : {
    //     totalChaosDuration : 30,
    //     chaosInterval : 10,
    //     force : false
    //   }
    // };

    // General
    cy.get("[data-cy=Context] input").should(
      "have.value",
      workflowParameters.general.context
    );
    cy.get("[data-cy=GeneralNext]").click();

    // Target Application
    // cy.get("[data-cy=Appns] input").should("have.value", workflowParameters.targetApp.appns);
    cy.get("[data-cy=AppKind] input").should(
      "have.value",
      workflowParameters.targetApp.appKind
    );
    cy.get("[data-cy=AppLabel] input").should(
      "have.value",
      workflowParameters.targetApp.appLabel
    );
    cy.get("[data-cy=TargetControlButtons] button").eq(1).click();

    // Steady State
    cy.get("[data-cy=SteadyStateControlButtons] button").eq(1).click();

    // Tune Experiment
    cy.get("[data-cy=TOTAL_CHAOS_DURATION] input").should(
      "have.value",
      workflowParameters.tuneExperiment.totalChaosDuration
    );
    cy.get("[data-cy=CHAOS_INTERVAL] input").should(
      "have.value",
      workflowParameters.tuneExperiment.chaosInterval
    );
    cy.get("[data-cy=FORCE] input").should(
      "have.value",
      workflowParameters.tuneExperiment.force
    );
    cy.get("[data-cy=TuneExperimentControlButtons] button").eq(1).click();
  }
);
