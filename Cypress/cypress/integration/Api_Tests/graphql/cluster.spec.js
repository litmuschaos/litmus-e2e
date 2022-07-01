/// <reference types="Cypress" />

import {
  REGISTER_CLUSTER,
  DELETE_CLUSTER,
} from "../../../fixtures/graphql/mutations";
import { GET_CLUSTER } from "../../../fixtures/graphql/queries";
import endpoints from "../../../fixtures/endpoints";

let adminProjectId,
  project1Id,
  project2Id,
  project3Id,
  adminAccessToken,
  user1AccessToken,
  user2AccessToken,
  user3AccessToken,
  cluster1Id;

before("Initial RBAC Setup", () => {
  cy.initialRBACSetup(true).then((data) => {
    adminProjectId = data.adminProjectId;
    project1Id = data.project1Id;
    project2Id = data.project2Id;
    project3Id = data.project3Id;
    adminAccessToken = data.adminAccessToken;
    user1AccessToken = data.user1AccessToken;
    user2AccessToken = data.user2AccessToken;
    user3AccessToken = data.user3AccessToken;
    cluster1Id = data.cluster1Id;
  });
});

describe("Testing cluster api", () => {
  it("Registering a new cluster", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "registerCluster",
        variables: {
          request: {
            clusterName: "cluster1",
            platformName: "AWS",
            projectID: adminProjectId,
            clusterType: "external",
            agentScope: "Cluster",
            tolerations: [],
          },
        },
        query: REGISTER_CLUSTER,
      },
      headers: {
        authorization: adminAccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.registerCluster.token");
      expect(res.body).to.have.nested.property(
        "data.registerCluster.clusterID"
      );
      expect(res.body).to.have.nested.property(
        "data.registerCluster.clusterName"
      );
      expect(res.body.data.registerCluster.clusterName).to.eq("cluster1");
      cluster1Id = res.body.data.registerCluster.clusterID;
    });
  });

  it("Testing input validation in registering a new cluster", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "registerCluster",
        variables: {
          request: {
            clusterName: "cluster1",
            platformName: "",
            projectID: adminProjectId,
            clusterType: "",
            agentScope: "",
            tolerations: [],
          },
        },
        query: REGISTER_CLUSTER,
      },
      headers: {
        authorization: adminAccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Registering a new cluster with same name", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "registerCluster",
        variables: {
          request: {
            clusterName: "cluster1",
            platformName: "AWS",
            projectID: adminProjectId,
            clusterType: "external",
            agentScope: "Cluster",
            tolerations: [],
          },
        },
        query: REGISTER_CLUSTER,
      },
      failOnStatusCode: false,
      headers: {
        authorization: adminAccessToken,
      },
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Listing all cluster", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "listClusters",
        variables: {
          projectID: adminProjectId,
        },
        query: GET_CLUSTER,
      },
      headers: {
        authorization: adminAccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.listClusters");
      expect(res.body.data.listClusters).to.be.an("array");
    });
  });

  it("Deleting a cluster", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "deleteClusters",
        variables: {
          projectID: adminProjectId,
          clusterIDs: [cluster1Id],
        },
        query: DELETE_CLUSTER,
      },
      headers: {
        authorization: adminAccessToken,
      },
    })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.nested.property("data.deleteClusterReg");
        return cy.request({
          method: "POST",
          url: Cypress.env("apiURL") + endpoints.query(),
          body: {
            operationName: "listClusters",
            variables: {
              projectID: adminProjectId,
            },
            query: GET_CLUSTER,
          },
          headers: {
            authorization: adminAccessToken,
          },
        });
      })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.nested.property("data.listClusters");
        expect(res.body.data.listClusters).to.be.an("array");
        expect(res.body.data.listClusters.length).to.eq(1);
      });
  });
});
