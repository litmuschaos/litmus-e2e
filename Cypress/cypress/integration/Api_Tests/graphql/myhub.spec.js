/// <reference types="Cypress" />

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
import endpoints from "../../../fixtures/endpoints";

let adminProjectId,
  project2Id,
  adminAccessToken,
  user1AccessToken,
  user2AccessToken,
  user3AccessToken,
  hubId;

before("Initial RBAC Setup", () => {
  cy.initialRBACSetup(false).then((data) => {
    adminProjectId = data.adminProjectId;
    project2Id = data.project2Id;
    adminAccessToken = data.adminAccessToken;
    user1AccessToken = data.user1AccessToken;
    user2AccessToken = data.user2AccessToken;
    user3AccessToken = data.user3AccessToken;
  });
});

describe("Testing myHub api", () => {
  it("Adding a new MyHub to a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
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
      headers: {
        authorization: adminAccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  it("Fetching status of the MyHub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "listHubStatus",
        variables: {
          projectID: project2Id,
        },
        query: GET_HUB_STATUS,
      },
      headers: {
        authorization: adminAccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  it("Adding a new MyHub to a project with viewer access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
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
      headers: {
        authorization: user2AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  it("Fetching status of the MyHub of a project with viewer access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "listHubStatus",
        variables: {
          projectID: project2Id,
        },
        query: GET_HUB_STATUS,
      },
      headers: {
        authorization: user2AccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.listHubStatus[0].id");
    });
  });

  it("Adding a new MyHub to a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "addChaosHub",
        variables: {
          request: {
            ...myhubInput.default,
            projectID: adminProjectId,
          },
        },
        query: ADD_MY_HUB,
      },
      headers: {
        authorization: user1AccessToken,
      },
      timeout: 600000,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.addChaosHub.id");
      hubId = res.body.data.addChaosHub.id;
    });
  });

  it("Fetching status of the MyHub of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "listHubStatus",
        variables: {
          projectID: adminProjectId,
        },
        query: GET_HUB_STATUS,
      },
      headers: {
        authorization: user1AccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.listHubStatus[0].id");
    });
  });

  it("Fetching all the charts from hub of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "listCharts",
        variables: {
          hubName: "my-chaos-hub",
          projectID: adminProjectId,
        },
        query: GET_CHARTS_DATA,
      },
      headers: {
        authorization: user1AccessToken,
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
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "getHubExperiment",
        variables: {
          request: {
            projectID: adminProjectId,
            chartName: "generic",
            experimentName: "pod-delete",
            hubName: "my-chaos-hub",
          },
        },
        query: GET_EXPERIMENT_DATA,
      },
      headers: {
        authorization: user1AccessToken,
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
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "getYAMLData",
        variables: {
          request: {
            projectID: adminProjectId,
            chartName: "generic",
            experimentName: "pod-delete",
            hubName: "my-chaos-hub",
            fileType: "EXPERIMENT",
          },
        },
        query: GET_EXPERIMENT_YAML,
      },
      headers: {
        authorization: user1AccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.getYAMLData");
    });
  });

  it("Fetching all the pre-defined workflows of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "listPredefinedWorkflows",
        variables: {
          hubName: "my-chaos-hub",
          projectID: adminProjectId,
        },
        query: GET_PREDEFINED_WORKFLOW_LIST,
      },
      headers: {
        authorization: user1AccessToken,
      },
      timeout: 600000,
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
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "getPredefinedExperimentYAML",
        variables: {
          request: {
            projectID: adminProjectId,
            chartName: "predefined",
            experimentName: "podtato-head",
            hubName: "my-chaos-hub",
            fileType: "WORKFLOW",
          },
        },
        query: GET_PREDEFINED_EXPERIMENT_YAML,
      },
      headers: {
        authorization: user1AccessToken,
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
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "updateChaosHub",
        variables: {
          request: {
            ...myhubInput.default,
            id: hubId,
            hubName: "my-chaos-hub-1",
            projectID: adminProjectId,
          },
        },
        query: UPDATE_MY_HUB,
      },
      headers: {
        authorization: user1AccessToken,
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
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "syncChaosHub",
        variables: {
          id: hubId,
          projectID: adminProjectId,
        },
        query: SYNC_REPO,
      },
      headers: {
        authorization: user1AccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.syncChaosHub[0].id");
    });
  });

  it("Updating the hub configuration of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "updateChaosHub",
        variables: {
          request: {
            ...myhubInput.default,
            id: hubId,
            hubName: "my-chaos-hub",
            projectID: adminProjectId,
          },
        },
        query: UPDATE_MY_HUB,
      },
      headers: {
        authorization: user2AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  it("Fetching all the charts from hub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "listCharts",
        variables: {
          hubName: "my-chaos-hub-1",
          projectID: adminProjectId,
        },
        query: GET_CHARTS_DATA,
      },
      headers: {
        authorization: user2AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  it("Fetching the experiment details from a selected chart of a project with no access [ Should not be possible ]s", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "getHubExperiment",
        variables: {
          request: {
            projectID: adminProjectId,
            chartName: "generic",
            experimentName: "pod-delete",
            hubName: "my-chaos-hub-1",
          },
        },
        query: GET_EXPERIMENT_DATA,
      },
      headers: {
        authorization: user2AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  it("Fetching the experiment manifest from the hub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "getYAMLData",
        variables: {
          request: {
            projectID: adminProjectId,
            chartName: "generic",
            experimentName: "pod-delete",
            hubName: "my-chaos-hub-1",
            fileType: "EXPERIMENT",
          },
        },
        query: GET_EXPERIMENT_YAML,
      },
      headers: {
        authorization: user2AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  it("Fetching all the pre-defined workflows of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "listPredefinedWorkflows",
        variables: {
          hubName: "my-chaos-hub-1",
          projectID: adminProjectId,
        },
        query: GET_PREDEFINED_WORKFLOW_LIST,
      },
      headers: {
        authorization: user2AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  it("Fetching the pre-defined experiment manifest from a hub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "getPredefinedExperimentYAML",
        variables: {
          request: {
            projectID: adminProjectId,
            chartName: "predefined",
            experimentName: "podtato-head",
            hubName: "my-chaos-hub-1",
            fileType: "WORKFLOW",
          },
        },
        query: GET_PREDEFINED_EXPERIMENT_YAML,
      },
      headers: {
        authorization: user2AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  it("Syncing the hub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "syncChaosHub",
        variables: {
          id: hubId,
          projectID: adminProjectId,
        },
        query: SYNC_REPO,
      },
      headers: {
        authorization: user2AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  it("Deleting the hub of a project with no access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "deleteChaosHub",
        variables: {
          hubID: hubId,
          projectID: adminProjectId,
        },
        query: DELETE_HUB,
      },
      headers: {
        authorization: user2AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  it("Deleting the hub of a project with viewer access [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "deleteChaosHub",
        variables: {
          hubID: hubId,
          projectID: adminProjectId,
        },
        query: DELETE_HUB,
      },
      headers: {
        authorization: user3AccessToken,
      },
    }).then((res) => {
      cy.validateErrorMessage(res, permission_denied);
    });
  });

  it("Deleting the hub of a project with editor access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "deleteChaosHub",
        variables: {
          hubID: hubId,
          projectID: adminProjectId,
        },
        query: DELETE_HUB,
      },
      headers: {
        authorization: user1AccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.deleteChaosHub");
      expect(res.body.data.deleteChaosHub).to.eq(true);
    });
  });
});
