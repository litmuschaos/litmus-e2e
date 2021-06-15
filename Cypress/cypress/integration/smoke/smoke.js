
/**
 * This test will go through all the core user stories
 * and try to do everything a user would do
 */

import * as user from "../../fixtures/Users.json";
import * as workflows from "../../fixtures/Workflows.json";

const setup = () => {    
    cy.requestLogin(user.AdminName, user.AdminPassword);    
    cy.waitForCluster("Self-Agent");    
}

const visitChooseWorkflowPage = () => {
    setup();
    cy.visit('/create-workflow');
    cy.chooseAgent(0);
    cy.get("[data-cy=ControlButtons] Button").click();
}

export const loginSmokeTest = () => {
    cy.visit('/login');
    cy.url().should("include","/login");
    expect("[data-cy=inputName]").to.exist;
    expect("[data-cy=inputPassword]").to.exist;

    // Clear existing cookies if any
    cy.clearCookie("token");
    // --------------------------------------------------------
    cy.log("Attempting Login With Incorrect Credentials");
    cy.login("Wrong Username", "Wrong Password");
    cy.contains("Wrong Credentials").should("be.visible");
    cy.log("Wrong Credentials Provided. Login Failed");
    // --------------------------------------------------------
    // Clearing provided credentials
    cy.get("[data-cy=inputName] input").clear();
    cy.get("[data-cy=inputPassword] input").clear();
    // --------------------------------------------------------
    cy.log("Attempting Login With Correct Credentials");
    cy.login(user.AdminName, user.AdminPassword);
    cy.intercept({
        url: 'http://localhost:8080/query',
    }).as('login');
    cy.wait('@login').its('response.statusCode').should('eq',200)
    cy.log("Login Successfully");    
}

/**
 * Workflow Scheduling Smoke Tests
 * Scenario 1 => Schedule a Predefined Workflow => function - schedulePreDefinedWorkflow()
 * Scenario 2 => Schedule a Custom Workflow
 * Scenario 3 => Schedule a Template 
 */

const schedule = () => {
    // Wait for GraphQL to fetch experiment
    cy.intercept({
        url: 'http://localhost:8080/query'
    }).as('getHubExperiment');
    cy.configureWorkflowSettings(
      workflows.nonRecurringworkflowName,
      workflows.nonRecurringworkflowDescription,
      0
    );
    cy.wait('@getHubExperiment').its('response.statusCode').should('eq',200)
    // Click Next on Workflow Settings Page
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    // Wait for GraphQL to fetch Predefined YAML
    cy.GraphqlWait(
      "GetPredefinedExperimentYAML",
      "PredefinedExperimentYAMLWait"
    );
    cy.wait('@PredefinedExperimentYAMLWait').its('response.statusCode').should('eq',200)
    // Click Next on Tune Workflow Page
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    // Click Next on Reliability Score Page
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    // Click Next on Schedule Page
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    // Click Finish on Verify & Commit Page
    cy.verifyDetails(
      workflows.nonRecurringworkflowName,
      workflows.nonRecurringworkflowDescription,
      0
    );
    cy.get("[data-cy=ControlButtons] Button").eq(0).click();
    // Click Go to Workflow on Modal
    cy.get("[data-cy=FinishModal]").should("be.visible");
    cy.get("[data-cy=GoToWorkflowButton]").click();
}

const schedulePreDefinedWorkflow = () => {
    cy.chooseWorkflow(0,0); // Choosing Podtato Head Predefined Workflow
    cy.get("[data-cy=ControlButtons] Button").eq(1).click();
    schedule();
}

export const workflowSmokeTest = () => {
    visitChooseWorkflowPage();
    schedulePreDefinedWorkflow();
}