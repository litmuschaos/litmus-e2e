/// <reference types="Cypress" />

import * as user from "../../../fixtures/Users.json";
import {
  REGISTER_CLUSTER,
  // DELETE_CLUSTER,
} from "../../../fixtures/graphql/mutations";
import { GET_CLUSTER } from "../../../fixtures/graphql/queries";

let project1Id, project2Id, cluster1Id;
before("Clear database", () => {
  cy.task("clearDB")
    .then(() => {
      return cy.createAgent("a1");
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
    })
    .then(() => {
      cy.request({
        method: "POST",
        url: Cypress.env("apiURL") + "/query",
        body: {
          operationName: "listClusters",
          variables: {
            projectID: project1Id,
          },
          query: GET_CLUSTER,
        },
      }).then((res) => {
        cluster1Id = res.body.data.listClusters[0].clusterID;
      });
    });
});

describe("Testing cluster api", () => {
  it("Registering a new cluster", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "registerCluster",
        variables: {
          request: {
            clusterName: "cluster1",
            platformName: "AWS",
            projectID: project1Id,
            clusterType: "external",
            agentScope: "Cluster",
            tolerations: [],
          },
        },
        query: REGISTER_CLUSTER,
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

  /*it("Testing input validation in registering a new cluster", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "registerCluster",
        variables: {
          request: {
            clusterName: "cluster1",
            platformName: "",
            projectID: project1Id,
            clusterType: "",
            agentScope: "",
            tolerations: [],
          },
        },
        query: REGISTER_CLUSTER,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });*/

  /*it("Registering a new cluster with same name", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "registerCluster",
        variables: {
          request: {
            clusterName: "cluster1",
            platformName: "AWS",
            projectID: project1Id,
            clusterType: "external",
            agentScope: "Cluster",
            tolerations: [],
          },
        },
        query: REGISTER_CLUSTER`,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });*/

  it("Listing all cluster", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "listClusters",
        variables: {
          projectID: project1Id,
        },
        query: GET_CLUSTER,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.listClusters");
      expect(res.body.data.listClusters).to.be.an("array");
    });
  });

  /*it("Deleting a cluster", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "deleteClusters",
        variables: {
          projectID: project1Id,
          clusterIDs: [cluster1Id],
        },
        query: DELETE_CLUSTER,
      },
    })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.nested.property("data.deleteClusterReg");
        return cy.request({
          method: "POST",
          url: Cypress.env("apiURL") + "/query",
          body: {
            operationName: "listClusters",
            variables: {
              projectID: project1Id,
            },
            query: GET_CLUSTER,
          },
        });
      })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.nested.property("data.listClusters");
        expect(res.body.data.listClusters).to.be.an("array");
        expect(res.body.data.listClusters.length).to.eq(1);
      });
  });*/
});
