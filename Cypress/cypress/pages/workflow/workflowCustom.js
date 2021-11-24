//// ************************* Workflow Tunning Page **********************

Cypress.Commands.add("tuneCustomWorkflow", (tunningParameters) => {
    // tunningParameters = {
    //   general : {
    //     hubName : "Litmus ChaosHub",
    //     experimentName : "pod-delete",
    //     context : "pod-delete_litmus"
    //   },
    //   targetApp : {
    //     annotationCheckToggle : false,
    //     appns : "default",
    //     appKind : "deployment",
    //     appLabel : "app=nginx",
    //     jobCleanUpPolicy : "retain" 
    //   },
    //   steadyState : {},
    //   tuneExperiment : {
    //     totalChaosDuration : 30,
    //     chaosInterval : 10,
    //     force : "false"
    //   } 
    // }

    // General
    cy.get("[data-cy=ExperimentName] input").clear().type(tunningParameters.general.experimentName);
    cy.get("[data-cy=Context] input").clear().type(tunningParameters.general.context);
    cy.get("[data-cy=GeneralNext]").click();

    // Target Application
    cy.get("[data-cy=AnnotationCheckToggle] button").eq((tunningParameters.targetApp.annotationCheckToggle) ? 0 : 1).click();
    cy.get("[data-cy=Appns] input").clear().type(tunningParameters.targetApp.appns).type('{esc}');
    cy.get("[data-cy=AppKind]").click();
    cy.get(`[data-value=${tunningParameters.targetApp.appKind}]`).click();
    cy.get("[data-cy=AppLabel] input").clear().type(tunningParameters.targetApp.appLabel).type('{esc}');
    cy.get("[data-cy=TargetControlButtons] button").eq(1).click();

    // Steady State
    cy.get("[data-cy=SteadyStateControlButtons] button").eq(1).click();

    // Tune Experiment
    cy.get("[data-cy=TOTAL_CHAOS_DURATION] input").clear().type(tunningParameters.tuneExperiment.totalChaosDuration);
    cy.get("[data-cy=CHAOS_INTERVAL] input").clear().type(tunningParameters.tuneExperiment.chaosInterval);
    cy.get("[data-cy=FORCE] input").clear().type(tunningParameters.tuneExperiment.force);
    cy.get("[data-cy=TuneExperimentControlButtons] button").eq(1).click();
});