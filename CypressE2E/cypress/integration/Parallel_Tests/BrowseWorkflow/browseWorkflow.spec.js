/// <reference types="Cypress" />
describe("Testing the Browse Workflow Tab", () => {
	//Login before initialization of test cases
	before("Clearing local storage", () => {
		cy.clearCookie("token");
		indexedDB.deleteDatabase("localforage");
		cy.requestLogin();
	});

	beforeEach("Refreshing page and starting server",()=>{
		cy.server();
		cy.visit("/");
	})
	it("Visiting the browse workflow page and verifying the availability of data", () => {
		cy.wait(2000); //Waiting for the homepage to load successfully
		cy.route({
			method: "POST",
			url: "/api/query",
		}).as("workflowData");
		cy.get("[data-cy=workflows]").click();
		cy.url().should("contain", "workflows");
		cy.get("[data-cy=browseWorkflow] > .MuiTab-wrapper").click();
		cy.get("[data-cy=browseWorkflowTable]").should("exist");
		cy.log("Browse Workflow Table Visible");
		//Get WorkFlowRuns data from the query
		cy.wait("@workflowData").then((data) => {
			if (JSON.parse(data.xhr.responseText).data.getWorkFlowRuns.length) {
				cy.get("[data-cy=browseWorkflowData]").should("exist");
				cy.log("Table data is present");
			} else if (
				JSON.parse(data.xhr.responseText).data.getWorkFlowRuns.length == 0
			) {
				cy.get("[data-cy=browseWorkflowNoData]").should("exist");
				cy.log("Table data is not present");
			} else if (data.status !== 200) {
				cy.get("[data-cy=browseWorkflowError]").should("exist");
				cy.log("Error while fetching data");
			}
		});
	});
	it("Testing the menu options in first row of Browse Workflow Table", () => {
		cy.wait(2000); //Waiting for the homepage to load successfully
		cy.route({
			method: "POST",
			url: "/api/query",
		}).as("workflowData"); //Alias for the WorkflowRuns Query
		cy.get("[data-cy=workflows]").click();
		cy.url().should("contain", "workflows");
		cy.get("[data-cy=browseWorkflow] > .MuiTab-wrapper").click();
		cy.get("[data-cy=browseWorkflowTable]").should("exist");
		cy.log("Browse Workflow Table Visible");
		//Get WorkFlowRuns data from the query
		cy.wait("@workflowData").then((data) => {
			if (JSON.parse(data.xhr.responseText).data.getWorkFlowRuns.length) {
				cy.get("[data-cy=browseWorkflowData]");
				cy.get("[data-cy=browseWorkflowOptions]").first().click();
				cy.get("[data-cy=workflowDetails]").first().should("exist"); //Workflow Details Option
				cy.get("[data-cy=workflowAnalytics]").first().should("exist"); //Workflow Analytics Option
			} else {
				cy.log("No data available");
			}
		});
	});
	it("Testing the menu options to redirect to the Argo Graph page", () => {
		cy.wait(2000); //Waiting for the homepage to load successfully
		cy.route({
			method: "POST",
			url: "/api/query",
		}).as("workflowData");
		cy.get("[data-cy=workflows]").click();
		cy.url().should("contain", "workflows");
		cy.get("[data-cy=browseWorkflow] > .MuiTab-wrapper").click();
		cy.get("[data-cy=browseWorkflowTable]").should("exist");
		cy.log("Browse Workflow Table Visible");
		//Get WorkFlowRuns data from the query
		cy.wait("@workflowData").then((data) => {
			if (JSON.parse(data.xhr.responseText).data.getWorkFlowRuns.length) {
				cy.get("[data-cy=browseWorkflowData]");
				cy.get("[data-cy=workflowName]")
					.first()
					.then(($name) => {
						const wfName = $name.text();
						cy.get("[data-cy=browseWorkflowOptions]").first().click();
						cy.get("[data-cy=workflowDetails]").first().click(); //Workflow Details Option
						//Checking if the workflow name in the table is same in the Argo graph page
						cy.get("[data-cy=wfName]").contains(wfName);
					});
			} else {
				cy.log("No data available");
			}
		});
	});
});
