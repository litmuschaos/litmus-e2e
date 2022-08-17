///  Validate workflow/experiment stats radial chart, Passed ve Failed bar graph, RR Score chart

Cypress.Commands.add(
  "validateWorkflowStatsGraph",
  (
    ExperimentsPassed,
    ExperimentsFailed,
    RScorePercent,
    PassedPercent,
    FailedPercent,
    workflowType = "Non Cron Chaos Scenario"
  ) => {
    cy.get("[data-cy=showStatsButton]").click();
    cy.wait(1000);
    cy.get("[data-cy=statsRadialChart] table").then(($table) => {
      cy.wrap($table)
        .find("tr")
        .eq(1)
        .find("td")
        .eq(1)
        .should("have.text", ExperimentsPassed);
      cy.wrap($table)
        .find("tr")
        .eq(2)
        .find("td")
        .eq(1)
        .should("have.text", ExperimentsFailed);
    });
    cy.get("[data-cy=statsResScoreChart] div > div")
      .find("div")
      .eq(2)
      .should("have.text", `${RScorePercent} %`);
    cy.get("[data-cy=statsPassFailBar]")
      .find("h6")
      .eq(0)
      .should("have.text", `${PassedPercent}%`);
    cy.get("[data-cy=statsPassFailBar]")
      .find("h6")
      .eq(1)
      .should("have.text", `${FailedPercent}%`);

    if (workflowType === "Cron workflow") {
      cy.get("[data-cy=statsDropdown]").click();
      cy.get("[data-value=1]").click();
      cy.get("[data-cy=statsPassFailBar]")
        .find("h6")
        .eq(0)
        .should("have.text", `${PassedPercent}%`);
      cy.get("[data-cy=statsPassFailBar]")
        .find("h6")
        .eq(1)
        .should("have.text", `${FailedPercent}%`);
    }
  }
);
