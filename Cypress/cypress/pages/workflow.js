import { apis, KUBE_API_TOKEN } from "../kube-apis/apis";
/// Script Containing Custom functions for Workflow Scheduling Flow

//// ******************* Choose Agent Page ********************************

Cypress.Commands.add("chooseAgent", (Agent) => {
  cy.get(`[data-cy=${Agent}] input`).check();
  cy.get(`[data-cy=${Agent}] input`).should("be.checked");
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
  cy.get("[data-cy=TargetControlButtons] button").eq(1).click();

  // Steady State
  cy.get("[data-cy=SteadyStateControlButtons] button").eq(1).click();

  // Tune Experiment
  cy.get("[data-cy=TOTAL_CHAOS_DURATION] input").clear().type(tunningParameters.tuneExperiment.totalChaosDuration);
  cy.get("[data-cy=CHAOS_INTERVAL] input").clear().type(tunningParameters.tuneExperiment.chaosInterval);
  cy.get("[data-cy=FORCE] input").clear().type(tunningParameters.tuneExperiment.force);
  cy.get("[data-cy=TuneExperimentControlButtons] button").eq(1).click();
});

Cypress.Commands.add("validatePredefinedWorkflowParameters", (workflowParameters) => {
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
  cy.get("[data-cy=Context] input").should("have.value", workflowParameters.general.context);
  cy.get("[data-cy=GeneralNext]").click();

  // Target Application
  // cy.get("[data-cy=Appns] input").should("have.value", workflowParameters.targetApp.appns);
  cy.get("[data-cy=AppKind] input").should("have.value", workflowParameters.targetApp.appKind);
  cy.get("[data-cy=AppLabel] input").should("have.value", workflowParameters.targetApp.appLabel);
  cy.get("[data-cy=TargetControlButtons] button").eq(1).click();

  // Steady State
  cy.get("[data-cy=SteadyStateControlButtons] button").eq(1).click();

  // Tune Experiment
  cy.get("[data-cy=TOTAL_CHAOS_DURATION] input").should("have.value", workflowParameters.tuneExperiment.totalChaosDuration);
  cy.get("[data-cy=CHAOS_INTERVAL] input").should("have.value", workflowParameters.tuneExperiment.chaosInterval);
  cy.get("[data-cy=FORCE] input").should("have.value", workflowParameters.tuneExperiment.force);
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

/// ************************** Validate workflow info and stats **********************

Cypress.Commands.add("validateWorkflowInfo", (workflowName, workflowNamespace, workflowSubject, agentName, regularity, nextRun) => {
  cy.GraphqlWait("workflowListDetails", "SelectedWorkflowStats");
  let workflowId = '';
  let clusterId = '';
  cy.wait("@recentRuns")
    .then((res) => {
      workflowId = res.response.body.data.ListWorkflow.workflows[0].workflow_id;
      clusterId = res.response.body.data.ListWorkflow.workflows[0].cluster_id;
      cy.get("[data-cy=infoWorkflowId]").should("have.text", workflowId);
      cy.get("[data-cy=infoClusterId]").should("have.text", clusterId);
    });
  cy.get("[data-cy=statsWorkflowName]").should("have.text", workflowName);
  cy.get("[data-cy=infoWorkflowName]").should("have.text", workflowName);
  cy.get("[data-cy=infoWorkflowSubject]").should("have.text", workflowSubject);
  cy.get("[data-cy=infoWorkflowNamespace]").should("have.text", workflowNamespace);
  cy.get("[data-cy=infoAgentName]").should("have.text", agentName);

  if (regularity === "Non cron workflow") {
    cy.get("[data-cy=infoWorkflowRegularity]").should("have.text", `Regularity :${regularity}`);
    cy.get("[data-cy=infoWorkflowNextRun]").should("have.text", `Next Run : ${nextRun}`);
  }
});

///  Validate workflow/experiment stats radial chart, Passed ve Failed bar graph, RR Score chart 

Cypress.Commands.add("validateStatsChart", () => {
  cy.get("[data-cy=showStatsButton]").click();
});

/// ************************** Validate experiments table **********************

Cypress.Commands.add("validateExperimentsTable", (experimentArray) => {
  cy.waitUntil(() =>
    cy.get("[data-cy=statsTable]")
      .find("tr")
      .eq(1)
      .then(($tr) => {
        return $tr.text() !== "No records available" ? true : false;
      }),
    {
      verbose: true,
      interval: 500,
      timeout: 600000,
    }
  );
  experimentArray.forEach((experiment, index) => {
    cy.get("[data-cy=statsTable]")
      .find("tr")
      .eq(index + 1)
      .then(($div) => {
        //	Experiment Name
        cy.wrap($div)
          .find("td")
          .eq(1)
          .should("have.text", experiment.experimentName);
        // 	Experiment Verdict
        cy.wrap($div)
          .find("td")
          .eq(2)
          .should("have.text", experiment.verdict);
        // 	Weight of the test
        cy.wrap($div)
          .find("td")
          .eq(3)
          .should("have.text", `${experiment.weightOfTest} Points`);
        // 	Resulting Points
        cy.wrap($div)
          .find("td")
          .eq(4)
          .should("have.text", `${experiment.resultingPoints} Points`);
      });
  });
});

///  Validate stats for recurring 

Cypress.Commands.add("validateRecurringStats", () => {
  cy.wait(1000);
  cy.get("[data-cy=statsHeatMap]")
    .within((el) => {
      cy.wrap(el)
        .find('[fill="#109B67"]')
        .click();
    });

  cy.wait(1000);
  cy.get("[data-cy=statsBarGraph")
    .within((el) => {
      cy.wrap(el)
        .find('g')
        .find('rect')
        .eq(2)
        .click();
    });
});

/// ************************** Validate workflow existence on cluster **********************

Cypress.Commands.add("validateWorkflowExistence", (workflowName, namespace) => {
  let workflowFound = false;
  cy.request({
    url: apis.getWorkflows(namespace),
    method: "GET",
    headers: {
      Authorization: `Bearer ${KUBE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
  }).should((response) => {
    response.body.items.some((item) => {
      if (item.metadata.name === workflowName){
        workflowFound = true;
        return true;
      }
    });
    if (workflowFound === false){
      throw new Error("Workflow Not Found in cluster");
    }
  });
});

/// ************************** Validate workflow existence on cluster **********************

Cypress.Commands.add("validateWorkflowStatus", (workflowName, namespace, expectedStatuses) => {
  cy.request({
    url: apis.getWorkflowByName(workflowName, namespace),
    method: "GET",
    headers: {
      Authorization: `Bearer ${KUBE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
  }).should((response) => {
    expect(expectedStatuses.includes(response.body.status.phase)).to.be.true;
  });
});