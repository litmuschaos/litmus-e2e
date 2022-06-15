/// <reference types="Cypress" />

import * as user from "../../../fixtures/Users.json";
import * as gitopsInput from "../../../fixtures/gitopsInput.json";
import {
  ENABLE_GITOPS,
  UPDATE_GITOPS,
  DISABLE_GITOPS,
} from "../../../fixtures/graphql/mutations";
import { GET_GITOPS_DATA } from "../../../fixtures/graphql/queries";

let project1Id, project2Id;
before("Clear database", () => {
  cy.task("clearDB")
    .then(() => {
      cy.requestLogin(user.AdminName, user.AdminPassword);
      cy.getStarted("litmus");
      return cy.task("getAdminProject");
    })
    .then((res) => {
      return cy.securityCheckSetup(res._id, res.name);
    })
    .then((createdSetupVariable) => {
      project1Id = createdSetupVariable.project1Id;
      project2Id = createdSetupVariable.project2Id;
      cy.requestLogin(user.user3.username, user.user3.password);
    });
});

describe("Testing GitOps api", () => {
  it("Enabling Gitops by user with viewer access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "enableGitOps",
        variables: {
          config: {
            ...gitopsInput.gitops1,
            projectID: project1Id,
            token: Cypress.env("githubToken"),
          },
        },
        query: ENABLE_GITOPS,
      },
      timeout: 600000,
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Enabling Gitops by user with no access", () => {
    cy.logout();
    cy.requestLogin(user.user2.username, user.user2.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "enableGitOps",
        variables: {
          config: {
            ...gitopsInput.gitops1,
            projectID: project1Id,
            token: Cypress.env("githubToken"),
          },
        },
        query: ENABLE_GITOPS,
      },
      timeout: 600000,
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Enabling Gitops by user with admin access", () => {
    cy.logout();
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "enableGitOps",
        variables: {
          config: {
            ...gitopsInput.gitops1,
            projectID: project1Id,
            token: Cypress.env("githubToken"),
          },
        },
        query: ENABLE_GITOPS,
      },
      timeout: 600000,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.enableGitOps");
      expect(res.body.data.enableGitOps).to.eq(true);
    });
  });

  it("Get GitOps Details by user with viewer access", () => {
    cy.logout();
    cy.requestLogin(user.user3.username, user.user3.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getGitOpsDetails",
        variables: {
          projectID: project1Id,
        },
        query: GET_GITOPS_DATA,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Get GitOps Details by user with no access", () => {
    cy.logout();
    cy.requestLogin(user.user2.username, user.user2.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getGitOpsDetails",
        variables: {
          projectID: project1Id,
        },
        query: GET_GITOPS_DATA,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Get GitOps Details by user with admin access", () => {
    cy.logout();
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getGitOpsDetails",
        variables: {
          projectID: project1Id,
        },
        query: GET_GITOPS_DATA,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.getGitOpsDetails.enabled");
      expect(res.body).to.have.nested.property("data.getGitOpsDetails.repoURL");
      expect(res.body).to.have.nested.property("data.getGitOpsDetails.branch");
      expect(res.body.data.getGitOpsDetails.enabled).to.eq(true);
      expect(res.body.data.getGitOpsDetails.repoURL).to.eq(
        gitopsInput.gitops1.repoURL
      );
      expect(res.body.data.getGitOpsDetails.branch).to.eq(
        gitopsInput.gitops1.branch
      );
    });
  });

  it("Update GitOps by user with viewer access", () => {
    cy.logout();
    cy.requestLogin(user.user3.username, user.user3.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "updateGitOps",
        variables: {
          config: {
            ...gitopsInput.gitops2,
            projectID: project1Id,
            token: Cypress.env("githubToken"),
          },
        },
        query: UPDATE_GITOPS,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Update GitOps by user with no access", () => {
    cy.logout();
    cy.requestLogin(user.user2.username, user.user2.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "updateGitOps",
        variables: {
          config: {
            ...gitopsInput.gitops2,
            projectID: project1Id,
            token: Cypress.env("githubToken"),
          },
        },
        query: UPDATE_GITOPS,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Update GitOps by user with admin access", () => {
    cy.logout();
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "updateGitOps",
        variables: {
          config: {
            ...gitopsInput.gitops2,
            projectID: project1Id,
            token: Cypress.env("githubToken"),
          },
        },
        query: UPDATE_GITOPS,
      },
    })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.nested.property("data.updateGitOps");
        expect(res.body.data.updateGitOps).to.eq(true);
        return cy.request({
          method: "POST",
          url: Cypress.env("apiURL") + "/query",
          body: {
            operationName: "getGitOpsDetails",
            variables: {
              projectID: project1Id,
            },
            query: GET_GITOPS_DATA,
          },
        });
      })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.nested.property(
          "data.getGitOpsDetails.enabled"
        );
        expect(res.body).to.have.nested.property(
          "data.getGitOpsDetails.repoURL"
        );
        expect(res.body).to.have.nested.property(
          "data.getGitOpsDetails.branch"
        );
        expect(res.body.data.getGitOpsDetails.enabled).to.eq(true);
        expect(res.body.data.getGitOpsDetails.repoURL).to.eq(
          gitopsInput.gitops2.repoURL
        );
        expect(res.body.data.getGitOpsDetails.branch).to.eq(
          gitopsInput.gitops2.branch
        );
      });
  });

  it("Disable GitOps by user with viewer access", () => {
    cy.logout();
    cy.requestLogin(user.user3.username, user.user3.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "disableGitOps",
        variables: {
          projectID: project1Id,
        },
        query: DISABLE_GITOPS,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Disable GitOps by user with no access", () => {
    cy.logout();
    cy.requestLogin(user.user2.username, user.user2.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "disableGitOps",
        variables: {
          projectID: project1Id,
        },
        query: DISABLE_GITOPS,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Disable GitOps by user with admin access", () => {
    cy.logout();
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "disableGitOps",
        variables: {
          projectID: project1Id,
        },
        query: DISABLE_GITOPS,
      },
    })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.nested.property("data.disableGitOps");
        expect(res.body.data.disableGitOps).to.eq(true);
        return cy.request({
          method: "POST",
          url: Cypress.env("apiURL") + "/query",
          body: {
            operationName: "getGitOpsDetails",
            variables: {
              projectID: project1Id,
            },
            query: GET_GITOPS_DATA,
          },
        });
      })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.nested.property(
          "data.getGitOpsDetails.enabled"
        );
        expect(res.body).to.have.nested.property(
          "data.getGitOpsDetails.repoURL"
        );
        expect(res.body).to.have.nested.property(
          "data.getGitOpsDetails.branch"
        );
        expect(res.body.data.getGitOpsDetails.enabled).to.eq(false);
        expect(res.body.data.getGitOpsDetails.repoURL).to.be.null;
        expect(res.body.data.getGitOpsDetails.branch).to.be.null;
      });
  });
});
