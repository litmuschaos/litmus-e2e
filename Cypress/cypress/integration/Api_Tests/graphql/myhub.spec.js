/// <reference types="Cypress" />

import * as user from "../../../fixtures/Users.json";
import {
  ADD_MY_HUB,
  DELETE_HUB,
  SYNC_REPO,
  UPDATE_MY_HUB,
} from "../../../fixtures/graphql/mutations";
import {
  GET_HUB_STATUS,
  GET_CHARTS_DATA,
  GET_EXPERIMENT_DATA,
  GET_EXPERIMENT_YAML,
  GET_PREDEFINED_WORKFLOW_LIST,
  GET_PREDEFINED_EXPERIMENT_YAML,
} from "../../../fixtures/graphql/queries";
import * as myhubInput from "../../../fixtures/myhubInput.json";
import { permission_denied } from "../../../fixtures/errorCodes";

let project1Id, project2Id, hubId;
before("Clear database", () => {
  cy.task("clearDB")
    .then(() => {
      return cy.requestLogin(user.AdminName, user.AdminPassword);
    })
    .then(() => {
      return cy.getStarted("litmus");
    })
    .then(() => {
      return cy.task("getAdminProject");
    })
    .then((res) => {
      return cy.securityCheckSetup(res._id, res.name);
    })
    .then((createdSetupVariable) => {
      project1Id = createdSetupVariable.project1Id;
      project2Id = createdSetupVariable.project2Id;
    })
    .then(() => {
      cy.requestLogin(user.AdminName, user.AdminPassword);
    });
});

describe("Testing myHub api", () => {
  it("Adding a new MyHub to a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "addChaosHub",
        variables: {
          request: {
            ...myhubInput.default,
            projectID: project2Id,
          },
        },
        query: ADD_MY_HUB,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  it("Fetching status of the MyHub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "listHubStatus",
        variables: {
          projectID: project2Id,
        },
        query: GET_HUB_STATUS,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  it("Adding a new MyHub to a project with viewer access [ Should not be possible ]", () => {
    cy.logout();
    cy.requestLogin(user.user2.username, user.user2.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "addChaosHub",
        variables: {
          request: {
            ...myhubInput.default,
            projectID: project2Id,
          },
        },
        query: ADD_MY_HUB,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  it("Fetching status of the MyHub of a project with viewer access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "listHubStatus",
        variables: {
          projectID: project2Id,
        },
        query: GET_HUB_STATUS,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.listHubStatus[0].id");
    });
  });

  it("Adding a new MyHub to a project with editor access", () => {
    cy.logout();
    cy.requestLogin(user.user1.username, user.user1.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "addChaosHub",
        variables: {
          request: {
            ...myhubInput.default,
            projectID: project1Id,
          },
        },
        query: ADD_MY_HUB,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.addChaosHub.id");
      hubId = res.body.data.addChaosHub.id;
    });
  });

  it("Fetching status of the MyHub of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "listHubStatus",
        variables: {
          projectID: project1Id,
        },
        query: GET_HUB_STATUS,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.listHubStatus[0].id");
    });
  });

  it("Fetching all the charts from hub of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "listCharts",
        variables: {
          hubName: "my-chaos-hub",
          projectID: project1Id,
        },
        query: GET_CHARTS_DATA,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.listCharts[0].apiVersion");
      expect(res.body).to.have.nested.property("data.listCharts[0].kind");
    });
  });

  it("Fetching the experiment details from a selected chart of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getHubExperiment",
        variables: {
          request: {
            projectID: project1Id,
            chartName: "generic",
            experimentName: "pod-delete",
            hubName: "my-chaos-hub",
          },
        },
        query: GET_EXPERIMENT_DATA,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.getHubExperiment.apiVersion"
      );
      expect(res.body).to.have.nested.property("data.getHubExperiment.kind");
    });
  });

  it("Fetching the experiment manifest from the hub of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getYAMLData",
        variables: {
          request: {
            projectID: project1Id,
            chartName: "generic",
            experimentName: "pod-delete",
            hubName: "my-chaos-hub",
            fileType: "EXPERIMENT",
          },
        },
        query: GET_EXPERIMENT_YAML,
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
        operationName: "listPredefinedWorkflows",
        variables: {
          hubName: "my-chaos-hub",
          projectID: project1Id,
        },
        query: GET_PREDEFINED_WORKFLOW_LIST,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.listPredefinedWorkflows[0]"
      );
    });
  });

  it("Fetching the experiment manifest from a hub of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getPredefinedExperimentYAML",
        variables: {
          request: {
            projectID: project1Id,
            chartName: "predefined",
            experimentName: "podtato-head",
            hubName: "my-chaos-hub",
            fileType: "WORKFLOW",
          },
        },
        query: GET_PREDEFINED_EXPERIMENT_YAML,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.getPredefinedExperimentYAML"
      );
    });
  });

  it("Updating the hub configuration of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "updateChaosHub",
        variables: {
          request: {
            ...myhubInput.default,
            id: hubId,
            hubName: "my-chaos-hub-1",
            projectID: project1Id,
          },
        },
        query: UPDATE_MY_HUB,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.updateChaosHub.hubName");
      expect(res.body.data.updateChaosHub.hubName).to.eq("my-chaos-hub-1");
    });
  });

  it("Syncing the hub of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "syncChaosHub",
        variables: {
          id: hubId,
          projectID: project1Id,
        },
        query: SYNC_REPO,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.syncChaosHub[0].id");
    });
  });

  it("Updating the hub configuration of a project with no access [ Should not be possible ]", () => {
    cy.logout();
    cy.requestLogin(user.user2.username, user.user2.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "updateChaosHub",
        variables: {
          request: {
            ...myhubInput.default,
            id: hubId,
            hubName: "my-chaos-hub",
            projectID: project1Id,
          },
        },
        query: UPDATE_MY_HUB,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  it("Fetching all the charts from hub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "listCharts",
        variables: {
          hubName: "my-chaos-hub-1",
          projectID: project1Id,
        },
        query: GET_CHARTS_DATA,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  it("Fetching the experiment details from a selected chart of a project with no access [ Should not be possible ]s", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getHubExperiment",
        variables: {
          request: {
            projectID: project1Id,
            chartName: "generic",
            experimentName: "pod-delete",
            hubName: "my-chaos-hub-1",
          },
        },
        query: GET_EXPERIMENT_DATA,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  /*   it("Fetching the experiment manifest from the hub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + '/query',
      body: { 
        "operationName": "getYAMLData",
        "variables": {
          "request": {
            "projectID": project1Id,
            "chartName": "generic",
            "experimentName": "pod-delete",
            "hubName": "my-chaos-hub-1",
            "fileType": "EXPERIMENT"
          }
        },
        "query": GET_EXPERIMENT_YAML
      },
      failOnStatusCode: false
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  }); */

  /*   it("Fetching all the pre-defined workflows of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + '/query',
      body: { 
        "operationName": "listPredefinedWorkflows",
        "variables": {
          "hubName": "my-chaos-hub-1",
          "projectID": project1Id,
        },
        "query": GET_PREDEFINED_WORKFLOW_LIST
      },
      failOnStatusCode: false
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  }); */

  /*   it("Fetching the pre-defined experiment manifest from a hub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + '/query',
      body: { 
        "operationName": "getPredefinedExperimentYAML",
        "variables": {
          "request": {
            "projectID": project1Id,
            "chartName": "predefined",
            "experimentName": "podtato-head",
            "hubName": "my-chaos-hub-1",
            "fileType": "WORKFLOW"
          }
        },
        "query": GET_PREDEFINED_EXPERIMENT_YAML
      },
      failOnStatusCode: false
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  }); */

  /*   it("Syncing the hub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + '/query',
      body: { 
        "operationName": "syncChaosHub",
        "variables": {
          id: hubId
        },
        "query": SYNC_REPO
      },
      failOnStatusCode: false
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  }); */

  /*   it("Deleting the hub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + '/query',
      body: { 
        "operationName": "deleteChaosHub",
        "variables": {
          "hubID": hubId
        },
        "query": DELETE_HUB
      },
      failOnStatusCode: false
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  }); */

  /*   it("Deleting the hub of a project with viewer access [ Should not be possible ]", () => {
    cy.logout();
    cy.requestLogin(user.user3.username, user.user3.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + '/query',
      body: { 
        "operationName": "deleteChaosHub",
        "variables": {
          "hubID": hubId
        },
        "query": DELETE_HUB
      },
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  }); */

  it("Deleting the hub of a project with editor access", () => {
    cy.logout();
    cy.requestLogin(user.user1.username, user.user1.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "deleteChaosHub",
        variables: {
          hubID: hubId,
          projectID: project1Id,
        },
        query: DELETE_HUB,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.deleteChaosHub");
      expect(res.body.data.deleteChaosHub).to.eq(true);
    });
  });
});
