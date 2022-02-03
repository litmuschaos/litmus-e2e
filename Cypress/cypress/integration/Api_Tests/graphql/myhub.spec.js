/// <reference types="Cypress" />

import * as user from "../../../fixtures/Users.json";
import {
  addMyHub,
  updateMyHub,
  deleteMyHub,
  syncHub,
} from "../../../fixtures/graphql/mutation";
import {
  getHubStatus,
  getCharts,
  getHubExperiment,
  getYAMLData,
  GetPredefinedWorkflowList,
  GetPredefinedExperimentYAML,
} from "../../../fixtures/graphql/queries";
import * as myhubInput from "../../../fixtures/myhubInput.json";

describe("Testing myHub api", () => {
  let project1Id, project2Id, hubId;
  before("Create 3 test users and 2 projects", () => {
    cy.task("getSecuritySetupVariable")
      .then((setupVariable) => {
        if (!setupVariable) {
          cy.securityCheckSetup().then((createdSetupVariable) => {
            project1Id = createdSetupVariable.project1Id;
            project2Id = createdSetupVariable.project2Id;
            cy.task("setSetupVariable", createdSetupVariable);
          });
        } else {
          project1Id = setupVariable.project1Id;
          project2Id = setupVariable.project2Id;
        }
      })
      .then(() => {
        cy.requestLogin(user.user2.username, user.user2.password);
      });
  });
  // Currently logged in as user 2
  it("Adding a new MyHub to a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "addMyHub",
        variables: {
          myhubInput: myhubInput.default,
          projectID: project1Id,
        },
        query: addMyHub,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Fetching status of the MyHub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getHubStatus",
        variables: {
          projectID: project1Id,
        },
        query: getHubStatus,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Adding a new MyHub to a project with viewer access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "addMyHub",
        variables: {
          myhubInput: myhubInput.default,
          projectID: project2Id,
        },
        query: addMyHub,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Fetching status of the MyHub of a project with viewer access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getHubStatus",
        variables: {
          projectID: project2Id,
        },
        query: getHubStatus,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.getHubStatus[0].id");
    });
  });

  it("Adding a new MyHub to a project with editor access", () => {
    cy.logout();
    cy.requestLogin(user.user1.username, user.user1.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "addMyHub",
        variables: {
          myhubInput: myhubInput.default,
          projectID: project1Id,
        },
        query: addMyHub,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.addMyHub.id");
      hubId = res.body.data.addMyHub.id;
    });
  });

  it("Fetching status of the MyHub of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getHubStatus",
        variables: {
          projectID: project1Id,
        },
        query: getHubStatus,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.getHubStatus[0].id");
    });
  });

  it("Fetching all the charts from hub of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getCharts",
        variables: {
          HubName: "my-chaos-hub",
          projectID: project1Id,
        },
        query: getCharts,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.getCharts[0].ApiVersion");
      expect(res.body).to.have.nested.property("data.getCharts[0].Kind");
    });
  });

  it("Fetching the experiment details from a selected chart of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getHubExperiment",
        variables: {
          experimentInput: {
            ProjectID: project1Id,
            ChartName: "generic",
            ExperimentName: "pod-delete",
            HubName: "my-chaos-hub",
          },
        },
        query: getHubExperiment,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.getHubExperiment.ApiVersion"
      );
      expect(res.body).to.have.nested.property("data.getHubExperiment.Kind");
    });
  });

  it("Fetching the experiment manifest from the hub of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getYAMLData",
        variables: {
          experimentInput: {
            ProjectID: project1Id,
            ChartName: "generic",
            ExperimentName: "pod-delete",
            HubName: "my-chaos-hub",
            FileType: "experiment",
          },
        },
        query: getYAMLData,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.getYAMLData");
    });
  });

  it("Fetching all the pre-defined workflows of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "GetPredefinedWorkflowList",
        variables: {
          HubName: "my-chaos-hub",
          projectID: project1Id,
        },
        query: GetPredefinedWorkflowList,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.GetPredefinedWorkflowList[0]"
      );
    });
  });

  it("Fetching the experiment manifest from a hub of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "GetPredefinedExperimentYAML",
        variables: {
          experimentInput: {
            ProjectID: project1Id,
            ChartName: "predefined",
            ExperimentName: "podtato-head",
            HubName: "my-chaos-hub",
            FileType: "workflow",
          },
        },
        query: GetPredefinedExperimentYAML,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.GetPredefinedExperimentYAML"
      );
    });
  });

  it("Updating the hub configuration of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "updateMyHub",
        variables: {
          myhubInput: {
            ...myhubInput.default,
            id: hubId,
            HubName: "my-chaos-hub-1",
          },
          projectID: project1Id,
        },
        query: updateMyHub,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.updateMyHub.HubName");
      expect(res.body.data.updateMyHub.HubName).to.eq("my-chaos-hub-1");
    });
  });

  it("Syncing the hub of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "syncHub",
        variables: {
          id: hubId,
        },
        query: syncHub,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.syncHub[0].id");
    });
  });

  it("Updating the hub configuration of a project with no access [ Should not be possible ]", () => {
    cy.logout();
    cy.requestLogin(user.user2.username, user.user2.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "updateMyHub",
        variables: {
          myhubInput: {
            ...myhubInput.default,
            id: hubId,
            HubName: "my-chaos-hub",
          },
          projectID: project1Id,
        },
        query: updateMyHub,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Fetching all the charts from hub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getCharts",
        variables: {
          HubName: "my-chaos-hub-1",
          projectID: project1Id,
        },
        query: getCharts,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Fetching the experiment details from a selected chart of a project with no access [ Should not be possible ]s", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getHubExperiment",
        variables: {
          experimentInput: {
            ProjectID: project1Id,
            ChartName: "generic",
            ExperimentName: "pod-delete",
            HubName: "my-chaos-hub-1",
          },
        },
        query: getHubExperiment,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  /*   it("Fetching the experiment manifest from the hub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + '/query',
      body: { 
        "operationName": "getYAMLData",
        "variables": {
          "experimentInput": {
            "ProjectID": project1Id,
            "ChartName": "generic",
            "ExperimentName": "pod-delete",
            "HubName": "my-chaos-hub-1",
            "FileType": "experiment"
          }
        },
        "query": getYAMLData
      },
      failOnStatusCode: false
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  }); */

  /*   it("Fetching all the pre-defined workflows of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + '/query',
      body: { 
        "operationName": "GetPredefinedWorkflowList",
        "variables": {
          "HubName": "my-chaos-hub-1",
          "projectID": project1Id,
        },
        "query": GetPredefinedWorkflowList
      },
      failOnStatusCode: false
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  }); */

  /*   it("Fetching the pre-defined experiment manifest from a hub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + '/query',
      body: { 
        "operationName": "GetPredefinedExperimentYAML",
        "variables": {
          "experimentInput": {
            "ProjectID": project1Id,
            "ChartName": "predefined",
            "ExperimentName": "podtato-head",
            "HubName": "my-chaos-hub-1",
            "FileType": "workflow"
          }
        },
        "query": GetPredefinedExperimentYAML
      },
      failOnStatusCode: false
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  }); */

  /*   it("Syncing the hub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + '/query',
      body: { 
        "operationName": "syncHub",
        "variables": {
          id: hubId
        },
        "query": syncHub
      },
      failOnStatusCode: false
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  }); */

  /*   it("Deleting the hub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + '/query',
      body: { 
        "operationName": "deleteMyHub",
        "variables": {
          "hub_id": hubId
        },
        "query": deleteMyHub
      },
      failOnStatusCode: false
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  }); */

  /*   it("Deleting the hub of a project with viewer access [ Should not be possible ]", () => {
    cy.logout();
    cy.requestLogin(user.user3.username, user.user3.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + '/query',
      body: { 
        "operationName": "deleteMyHub",
        "variables": {
          "hub_id": hubId
        },
        "query": deleteMyHub
      },
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  }); */

  it("Deleting the hub of a project with editor access", () => {
    cy.logout();
    cy.requestLogin(user.user1.username, user.user1.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "deleteMyHub",
        variables: {
          hub_id: hubId,
        },
        query: deleteMyHub,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.deleteMyHub");
      expect(res.body.data.deleteMyHub).to.eq(true);
    });
  });
});
