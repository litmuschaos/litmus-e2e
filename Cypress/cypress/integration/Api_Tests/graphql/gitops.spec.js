/// <reference types="Cypress" />

import * as gitopsInput from "../../../fixtures/gitopsInput.json";
import {
  ENABLE_GITOPS,
  UPDATE_GITOPS,
  DISABLE_GITOPS,
} from "../../../fixtures/graphql/mutations";
import { GET_GITOPS_DATA } from "../../../fixtures/graphql/queries";
import endpoints from "../../../fixtures/endpoints";

let adminProjectId, adminAccessToken, user2AccessToken, user3AccessToken;

before("Initial RBAC Setup", () => {
  cy.initialRBACSetup(false).then((data) => {
    adminProjectId = data.adminProjectId;
    adminAccessToken = data.adminAccessToken;
    user2AccessToken = data.user2AccessToken;
    user3AccessToken = data.user3AccessToken;
  });
});

describe("Testing GitOps api", () => {
  it("Enabling Gitops by user with viewer access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "enableGitOps",
        variables: {
          config: {
            ...gitopsInput.gitops1,
            projectID: adminProjectId,
            token: Cypress.env("githubToken"),
          },
        },
        query: ENABLE_GITOPS,
      },
      headers: {
        authorization: user3AccessToken,
      },
      timeout: 600000,
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Enabling Gitops by user with no access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "enableGitOps",
        variables: {
          config: {
            ...gitopsInput.gitops1,
            projectID: adminProjectId,
            token: Cypress.env("githubToken"),
          },
        },
        query: ENABLE_GITOPS,
      },
      headers: {
        authorization: user2AccessToken,
      },
      timeout: 600000,
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Enabling Gitops by user with admin access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "enableGitOps",
        variables: {
          config: {
            ...gitopsInput.gitops1,
            projectID: adminProjectId,
            token: Cypress.env("githubToken"),
          },
        },
        query: ENABLE_GITOPS,
      },
      headers: {
        authorization: adminAccessToken,
      },
      timeout: 600000,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.enableGitOps");
      expect(res.body.data.enableGitOps).to.eq(true);
    });
  });

  it("Get GitOps Details by user with viewer access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "getGitOpsDetails",
        variables: {
          projectID: adminProjectId,
        },
        query: GET_GITOPS_DATA,
      },
      headers: {
        authorization: user3AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Get GitOps Details by user with no access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "getGitOpsDetails",
        variables: {
          projectID: adminProjectId,
        },
        query: GET_GITOPS_DATA,
      },
      headers: {
        authorization: user2AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Get GitOps Details by user with admin access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "getGitOpsDetails",
        variables: {
          projectID: adminProjectId,
        },
        query: GET_GITOPS_DATA,
      },
      headers: {
        authorization: adminAccessToken,
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
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "updateGitOps",
        variables: {
          config: {
            ...gitopsInput.gitops2,
            projectID: adminProjectId,
            token: Cypress.env("githubToken"),
          },
        },
        query: UPDATE_GITOPS,
      },
      headers: {
        authorization: user3AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Update GitOps by user with no access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "updateGitOps",
        variables: {
          config: {
            ...gitopsInput.gitops2,
            projectID: adminProjectId,
            token: Cypress.env("githubToken"),
          },
        },
        query: UPDATE_GITOPS,
      },
      headers: {
        authorization: user2AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Update GitOps by user with admin access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "updateGitOps",
        variables: {
          config: {
            ...gitopsInput.gitops2,
            projectID: adminProjectId,
            token: Cypress.env("githubToken"),
          },
        },
        headers: {
          authorization: adminAccessToken,
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
          url: Cypress.env("apiURL") + endpoints.query(),
          body: {
            operationName: "getGitOpsDetails",
            variables: {
              projectID: adminProjectId,
            },
            query: GET_GITOPS_DATA,
          },
          headers: {
            authorization: adminAccessToken,
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
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "disableGitOps",
        variables: {
          projectID: adminProjectId,
        },
        query: DISABLE_GITOPS,
      },
      headers: {
        authorization: user3AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Disable GitOps by user with no access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "disableGitOps",
        variables: {
          projectID: adminProjectId,
        },
        query: DISABLE_GITOPS,
      },
      headers: {
        authorization: user2AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Disable GitOps by user with admin access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "disableGitOps",
        variables: {
          projectID: adminProjectId,
        },
        query: DISABLE_GITOPS,
      },
      headers: {
        authorization: adminAccessToken,
      },
    })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.nested.property("data.disableGitOps");
        expect(res.body.data.disableGitOps).to.eq(true);
        return cy.request({
          method: "POST",
          url: Cypress.env("apiURL") + endpoints.query(),
          body: {
            operationName: "getGitOpsDetails",
            variables: {
              projectID: adminProjectId,
            },
            query: GET_GITOPS_DATA,
          },
          headers: {
            authorization: adminAccessToken,
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
