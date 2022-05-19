/// ************************** Verify and Commit Page **********************

Cypress.Commands.add(
  "verifyDetails",
  (name, description, schedule, min = 0) => {
    cy.get("[data-cy=WorkflowName]").should("include.text", name); // Name validation
    cy.get("[data-cy=WorkflowDescription]").should("have.text", description); // Description Validation
    if (schedule == 0)
      cy.get("[data-cy=schedule]").should("have.text", "Scheduling now");
    // Schedule Validation
    else if (schedule == 1)
      cy.get("[data-cy=schedule]").should(
        "have.text",
        `At ${min} minutes past the hour, between 12:00 AM and 11:59 PM`
      );
    // cy.get("[data-cy=AgentName]").should("have.text", agent);
  }
);

/// ************************** Validate verdict of given workflow and agent **********************

Cypress.Commands.add(
  "validateVerdict",
  (
    workflowName,
    agent,
    expectedVerdict,
    RScore,
    ExperimentsPassed,
    TotalExperiments,
    Experiments
  ) => {
    cy.visit("/workflows");
    cy.GraphqlWait("listWorkflows", "listSchedules");
    cy.get("[data-cy=runs]").click();
    cy.wait("@listSchedules").its("response.statusCode").should("eq", 200);
    cy.wait(1000);
    cy.waitUntil(
      () =>
        cy
          .get("table")
          .find(`[data-cy=${workflowName}]`)
          .eq(0)
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
    cy.waitUntil(
      () =>
        cy
          .get("table")
          .find(`[data-cy=${workflowName}]`)
          .eq(0)
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
    cy.get("table")
      .find(`[data-cy=${workflowName}]`)
      .eq(0)
      .then(($div) => {
        cy.wrap($div).find("td").eq(3).should("have.text", agent); // Matching Target Agent
        cy.wrap($div)
          .find("[data-cy=ResScore]")
          .should("have.text", `Overall RR : ${RScore}%`);
        cy.wrap($div)
          .find("[data-cy=ExperimentsPassed]")
          .should(
            "have.text",
            `Experiments Passed : ${ExperimentsPassed}/${TotalExperiments}`
          );
        cy.wrap($div)
          .find("[data-cy=WorkflowStatus]")
          .should("have.text", expectedVerdict);
        cy.wrap($div).find("td").eq(2).should("have.text", workflowName); // Matching Workflow Name
        cy.wrap($div)
          .find("td")
          .eq(5)
          .find("button")
          .click({ scrollBehavior: false });
      });
    Experiments.map((experiment) => {
      cy.get("[data-cy=expName]").should("have.text", experiment.name);
      cy.get("[data-cy=expWeight]").should(
        "have.text",
        experiment.weight === 1 || 0
          ? `${experiment.weight} point`
          : `${experiment.weight} points`
      );
    });
  }
);

/// ************************** Validate dagre graph nodes **********************

Cypress.Commands.add("validateGraphNodes", (graphNodesNameArray) => {
  let nodes = [];
  cy.waitUntil(
    () =>
      cy.get("[data-cy=DagreGraphSvg]").within(() => {
        cy.get("g")
          .find(".output g")
          .find("circle")
          .find("title")
          .each(($text) => {
            nodes.push($text.text());
          })
          .then(() => {
            return graphNodesNameArray.every((val) => nodes.includes(val));
          });
      }),
    {
      verbose: true,
      interval: 500,
      timeout: 60000,
    }
  );
});

/// ************************** Validate workflow info and stats **********************

Cypress.Commands.add(
  "validateWorkflowInfo",
  (
    workflowName,
    workflowNamespace,
    workflowSubject,
    agentName,
    regularity,
    nextRun
  ) => {
    cy.GraphqlWait("listWorkflows", "SelectedWorkflowStats");
    cy.wait("@recentRuns").its("response.statusCode").should("eq", 200);
    cy.get("[data-cy=statsWorkflowName]").should("have.text", workflowName);
    cy.get("[data-cy=infoWorkflowName]").should("have.text", workflowName);
    cy.get("[data-cy=infoWorkflowSubject]").should(
      "have.text",
      workflowSubject
    );
    cy.get("[data-cy=infoWorkflowNamespace]").should(
      "have.text",
      workflowNamespace
    );
    cy.get("[data-cy=infoAgentName]").should("have.text", agentName);

    if (regularity === "Non cron workflow") {
      cy.get("[data-cy=infoWorkflowRegularity]").should(
        "have.text",
        `Regularity :${regularity}`
      );
      cy.get("[data-cy=infoWorkflowNextRun]").should(
        "have.text",
        `Next Run : ${nextRun}`
      );
    }
  }
);

/// ************************** Validate experiments table **********************

Cypress.Commands.add("validateExperimentsTable", (experimentArray) => {
  cy.waitUntil(
    () =>
      cy
        .get("[data-cy=statsTable]")
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
    cy.wait(1000) // Table is taking time to get refreshed with new data
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
        cy.wrap($div).find("td").eq(2).should("have.text", experiment.verdict);
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
