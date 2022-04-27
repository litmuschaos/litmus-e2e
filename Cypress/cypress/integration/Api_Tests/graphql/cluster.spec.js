/// <reference types="Cypress" />

import * as user from "../../../fixtures/Users.json";
import {
  userClusterReg,
  deleteClusters,
} from "../../../fixtures/graphql/mutation";
import { getCluster } from "../../../fixtures/graphql/queries";

let project1Id, cluster1Id;
before("Clear Database", () => {
  cy.task("clearDB");
  cy.securityCheckSetup()
    .then((createdSetupVariable) => {
      project1Id = createdSetupVariable.project1Id;
    })
    .then(() => {
      cy.requestLogin(user.AdminName, user.AdminPassword);
    });
});

describe("Testing cluster api", () => {
  it("Registering a new cluster", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "userClusterReg",
        variables: {
          clusterInput: {
            cluster_name: "cluster1",
            platform_name: "AWS",
            project_id: project1Id,
            cluster_type: "external",
            agent_scope: "Cluster",
            tolerations: [],
          },
        },
        query: userClusterReg,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.userClusterReg.token");
      expect(res.body).to.have.nested.property(
        "data.userClusterReg.cluster_id"
      );
      expect(res.body).to.have.nested.property(
        "data.userClusterReg.cluster_name"
      );
      expect(res.body.data.userClusterReg.cluster_name).to.eq("cluster1");
      cluster1Id = res.body.data.userClusterReg.cluster_id;
    });
  });

  /*it("Testing input validation in registering a new cluster", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "userClusterReg",
        variables: {
          clusterInput: {
            cluster_name: "cluster1",
            platform_name: "",
            project_id: project1Id,
            cluster_type: "",
            agent_scope: "",
            tolerations: [],
          },
        },
        query: userClusterReg,
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
        operationName: "userClusterReg",
        variables: {
          clusterInput: {
            cluster_name: "cluster1",
            platform_name: "AWS",
            project_id: project1Id,
            cluster_type: "external",
            agent_scope: "Cluster",
            tolerations: [],
          },
        },
        query: userClusterReg,
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
        operationName: "getCluster",
        variables: {
          project_id: project1Id,
        },
        query: getCluster,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.getCluster");
      expect(res.body.data.getCluster).to.be.an("array");
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
          cluster_ids: [cluster1Id],
        },
        query: deleteClusters,
      },
    })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.nested.property("data.deleteClusterReg");
        return cy.request({
          method: "POST",
          url: Cypress.env("apiURL") + "/query",
          body: {
            operationName: "getCluster",
            variables: {
              project_id: project1Id,
            },
            query: getCluster,
          },
        });
      })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.nested.property("data.getCluster");
        expect(res.body.data.getCluster).to.be.an("array");
        expect(res.body.data.getCluster.length).to.eq(1);
      });
  });*/
});
