/// Script Containing Custom functions for Workflow Scheduling Flow

//// ******************* Choose Agent Page ********************************

Cypress.Commands.add("chooseAgent", (Agent) => {
  cy.get('[type="radio"]').eq(Agent).check();
  cy.get('[type="radio"]').eq(Agent).should("be.checked");
});

//// *******************Choose Workflow Page *****************************

Cypress.Commands.add("chooseWorkflow", (option, subOption, sampleYAML="sample-workflow.yaml") => {
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
      sampleYAML
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
  cy.get("[data-cy=AnnotationCheckToggle] button").eq((tunningParameters.targetApp.annotationCheckToggle)?0:1).click();
  cy.get("[data-cy=Appns] input").clear().type(tunningParameters.targetApp.appns).type('{enter}');
  cy.get("[data-cy=AppKind]").click();
  cy.get(`[data-value=${tunningParameters.targetApp.appKind}]`).click();
  cy.get("[data-cy=AppLabel] input").clear().type(tunningParameters.targetApp.appLabel).type('{enter}');
  cy.get("[data-cy=JobCleanUpPolicy] input").clear().type(tunningParameters.targetApp.jobCleanUpPolicy);
  cy.get("[data-cy=TargetControlButtons] button").eq(1).click();

  // Steady State
  cy.get("[data-cy=SteadyStateControlButtons] button").eq(1).click();

  // Tune Experiment
  cy.get("[data-cy=TOTAL_CHAOS_DURATION] input").clear().type(tunningParameters.tuneExperiment.totalChaosDuration);
  cy.get("[data-cy=CHAOS_INTERVAL] input").clear().type(tunningParameters.tuneExperiment.chaosInterval);
  cy.get("[data-cy=FORCE] input").clear().type(tunningParameters.tuneExperiment.force);
  cy.get("[data-cy=TuneExperimentControlButtons] button").eq(1).click();
});

Cypress.Commands.add("tunePredefinedWorkflow", (tunningParameters) => {
  // tunningParameters = {
  //   general : {
  //     context : "pod-network-loss-chaos_litmus"
  //   },
  //   targetApp : {
  //     annotationCheckToggle : false,
  //     appns : "bank",
  //     appKind : "deployment",
  //     appLabel : "name in (balancereader,transactionhistory)",
  //     jobCleanUpPolicy : "retain" 
  //   },
  //   steadyState : {},
  //   tuneExperiment : {
  //     totalChaosDuration : 90,
  //     networkInterface : "eth0",
  //     networkPacketLossPercent : 100
  //   } 
  // }

  // General
  cy.get("[data-cy=Context] input").clear().type(tunningParameters.general.context);
  cy.get("[data-cy=GeneralNext]").click();

  // Target Application
  cy.get("[data-cy=AnnotationCheckToggle] button").eq((tunningParameters.targetApp.annotationCheckToggle)?0:1).click();
  cy.get("[data-cy=Appns] input").clear().type(tunningParameters.targetApp.appns).type('{enter}');
  cy.get("[data-cy=AppKind]").click();
  cy.get(`[data-value=${tunningParameters.targetApp.appKind}]`).click();
  cy.get("[data-cy=AppLabel] input").clear().type(tunningParameters.targetApp.appLabel).type('{enter}');;
  cy.get("[data-cy=JobCleanUpPolicy] input").clear().type(tunningParameters.targetApp.jobCleanUpPolicy);
  cy.get("[data-cy=TargetControlButtons] button").eq(1).click();

  // Steady State
  cy.get("[data-cy=SteadyStateControlButtons] button").eq(1).click();

  // Tune Experiment
  cy.get("[data-cy=TOTAL_CHAOS_DURATION] input").clear().type(tunningParameters.tuneExperiment.totalChaosDuration);
  cy.get("[data-cy=NETWORK_INTERFACE] input").clear().type(tunningParameters.tuneExperiment.networkInterface);
  cy.get("[data-cy=NETWORK_PACKET_LOSS_PERCENTAGE] input").clear().type(tunningParameters.tuneExperiment.networkPacketLossPercent);
  cy.get("[data-cy=TuneExperimentControlButtons] button").eq(1).click();
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

Cypress.Commands.add("selectSchedule", (option, subOption, min=0) => {
  cy.get("[data-cy=ScheduleOptions]").should("be.visible");
  cy.get("[type=radio]").eq(option).check();

  if (option === 1) {
    cy.get("[data-cy=RecurringSchedule] :radio").eq(subOption).check();
    cy.get("[data-cy=RecurringSelect]").click();
    cy.get(`[data-cy=${min}]`).click();
  }
});

/// ************************** Verify and Commit Page **********************

Cypress.Commands.add("verifyDetails", (name, description, schedule, min=0) => {
  cy.get("[data-cy=WorkflowName]").should("include.text", name); // Name validation
  cy.get("[data-cy=WorkflowDescription]").should("have.text", description); // Description Validation
  if (schedule == 0)
    cy.get("[data-cy=schedule]").should("have.text", "Scheduling now"); // Schedule Validation
  else if (schedule == 1)
    cy.get("[data-cy=schedule]").should("have.text", `At ${min} minutes past the hour, between 12:00 AM and 11:59 PM`);
  // cy.get("[data-cy=AgentName]").should("have.text", "Self-Agent");
});

/// ************************** Validate verdict of given workflow and agent **********************

Cypress.Commands.add("validateVerdict", (workflowName, agentName, expectedVerdict, RScore, ExperimentsPassed, TotalExperiments) => {
  cy.visit("/workflows");
  cy.GraphqlWait("workflowListDetails", "listSchedules");
  cy.get("[data-cy=runs]").click();
  cy.wait("@listSchedules").its("response.statusCode").should("eq", 200);
  cy.wait(1000);
  cy.waitUntil(() =>
    cy.get("table")
      .find(`[data-cy=${workflowName}]`)
      .find("[data-cy=WorkflowStatus]")
      .then((status) => {
        return status.text() != "Running" ? true : false;
      }),
    {
      verbose: true,
      interval: 500,
      timeout: 600000,
    }
  );
  cy.get('table')
    .find(`[data-cy=${workflowName}]`)
    .find("[data-cy=WorkflowStatus]")
    .should("have.text", expectedVerdict);
  cy.get('table')
    .find(`[data-cy=${workflowName}]`)
    .find("[data-cy=ResScore]")
    .should("have.text",`Overall RR : ${RScore}%`);
  cy.waitUntil(() =>
    cy.get("table")
      .find(`[data-cy=${workflowName}]`)
      .find("[data-cy=ExperimentsPassed]")
      .then((expPassed) => {
        return expPassed.text() != "Experiments Passed : NA" ? true : false;
      }),
    {
      verbose: true,
      interval: 500,
      timeout: 600000,
    }
  );
  cy.get('table')
    .find(`[data-cy=${workflowName}]`)
    .find("[data-cy=ExperimentsPassed]")
    .should("have.text",`Experiments Passed : ${ExperimentsPassed}/${TotalExperiments}`);
});

/// ************************** Validate dagre graph nodes **********************

Cypress.Commands.add("validateGraphNodes", (graphNodesNameArray) => {
  let nodes = [];
  cy.waitUntil(() =>
    cy.get("[data-cy=DagreGraphSvg]")
      .find("text")
      .each(($text) => {
        nodes.push($text.text());
      }).then(() => {
        return graphNodesNameArray.every(val => nodes.includes(val));
      }),
      {
        verbose: true,
        interval: 500,
        timeout: 60000,
      }
  );
});