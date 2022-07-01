/// <reference types="Cypress" />

import * as imageRegistryInput from "../../../fixtures/imageRegistryInput.json";
import {
  ADD_IMAGE_REGISTRY,
  UPDATE_IMAGE_REGISTRY,
  DELETE_IMAGE_REGISTRY,
} from "../../../fixtures/graphql/mutations";
import { GET_IMAGE_REGISTRY } from "../../../fixtures/graphql/queries";
import endpoints from "../../../fixtures/endpoints";

let imageRegistryID,
  adminProjectId,
  adminAccessToken,
  user2AccessToken,
  user3AccessToken;

before("Initial RBAC Setup", () => {
  cy.initialRBACSetup(false).then((data) => {
    adminProjectId = data.adminProjectId;
    adminAccessToken = data.adminAccessToken;
    user2AccessToken = data.user2AccessToken;
    user3AccessToken = data.user3AccessToken;
  });
});

describe("Testing image registry api", () => {
  it("Create image registry by user with viewer access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "createImageRegistry",
        variables: {
          projectID: adminProjectId,
          imageRegistryInfo: imageRegistryInput.registry1,
        },
        query: ADD_IMAGE_REGISTRY,
      },
      headers: {
        authorization: user3AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Create image registry by user with no access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "createImageRegistry",
        variables: {
          projectID: adminProjectId,
          imageRegistryInfo: imageRegistryInput.registry1,
        },
        query: ADD_IMAGE_REGISTRY,
      },
      headers: {
        authorization: user2AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Create image registry by user with admin access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "createImageRegistry",
        variables: {
          projectID: adminProjectId,
          imageRegistryInfo: imageRegistryInput.registry1,
        },
        query: ADD_IMAGE_REGISTRY,
      },
      headers: {
        authorization: adminAccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.createImageRegistry");
      imageRegistryID = res.body.data.createImageRegistry.imageRegistryID;
    });
  });

  it("Get image registry by user with viewer access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "getImageRegistry",
        variables: {
          projectID: adminProjectId,
          imageRegistryID: imageRegistryID,
        },
        query: GET_IMAGE_REGISTRY,
      },
      headers: {
        authorization: user3AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Get image registry by user with no access", () => {
    cy.logout();
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "getImageRegistry",
        variables: {
          projectID: adminProjectId,
          imageRegistryID: imageRegistryID,
        },
        query: GET_IMAGE_REGISTRY,
      },
      headers: {
        authorization: user2AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Get image registry by user with admin access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "getImageRegistry",
        variables: {
          projectID: adminProjectId,
          imageRegistryID: imageRegistryID,
        },
        query: GET_IMAGE_REGISTRY,
      },
      headers: {
        authorization: adminAccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.getImageRegistry.isDefault"
      );
      expect(res.body).to.have.nested.property(
        "data.getImageRegistry.imageRegistryID"
      );
      expect(res.body).to.have.nested.property(
        "data.getImageRegistry.projectID"
      );
      expect(res.body.data.getImageRegistry.isDefault).to.eq(
        imageRegistryInput.registry1.isDefault
      );
      expect(res.body.data.getImageRegistry.imageRegistryID).to.eq(
        imageRegistryID
      );
      expect(res.body.data.getImageRegistry.projectID).to.eq(adminProjectId);
    });
  });

  it("Update image registry by user with viewer access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "updateImageRegistry",
        variables: {
          imageRegistryID: imageRegistryID,
          projectID: adminProjectId,
          imageRegistryInfo: imageRegistryInput.registry2,
        },
        query: UPDATE_IMAGE_REGISTRY,
      },
      headers: {
        authorization: user3AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Update image registry by user with no access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "updateImageRegistry",
        variables: {
          imageRegistryID: imageRegistryID,
          projectID: adminProjectId,
          imageRegistryInfo: imageRegistryInput.registry2,
        },
        query: UPDATE_IMAGE_REGISTRY,
      },
      headers: {
        authorization: user2AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Update image registry by user with admin access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "updateImageRegistry",
        variables: {
          imageRegistryID: imageRegistryID,
          projectID: adminProjectId,
          imageRegistryInfo: imageRegistryInput.registry2,
        },
        query: UPDATE_IMAGE_REGISTRY,
      },
      headers: {
        authorization: adminAccessToken,
      },
    })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.nested.property("data.updateImageRegistry");
        return cy.request({
          method: "POST",
          url: Cypress.env("apiURL") + endpoints.query(),
          body: {
            operationName: "getImageRegistry",
            variables: {
              projectID: adminProjectId,
              imageRegistryID: imageRegistryID,
            },
            query: GET_IMAGE_REGISTRY,
          },
          headers: {
            authorization: adminAccessToken,
          },
        });
      })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.nested.property(
          "data.getImageRegistry.isDefault"
        );
        expect(res.body).to.have.nested.property(
          "data.getImageRegistry.imageRegistryID"
        );
        expect(res.body).to.have.nested.property(
          "data.getImageRegistry.projectID"
        );
        expect(res.body.data.getImageRegistry.isDefault).to.eq(
          imageRegistryInput.registry2.isDefault
        );
        expect(res.body.data.getImageRegistry.imageRegistryID).to.eq(
          imageRegistryID
        );
        expect(res.body.data.getImageRegistry.projectID).to.eq(adminProjectId);
      });
  });

  it("Delete image registry by user with viewer access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "deleteImageRegistry",
        variables: {
          imageRegistryID: imageRegistryID,
          projectID: adminProjectId,
        },
        query: DELETE_IMAGE_REGISTRY,
      },
      headers: {
        authorization: user3AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Delete image registry by user with no access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "deleteImageRegistry",
        variables: {
          imageRegistryID: imageRegistryID,
          projectID: adminProjectId,
        },
        query: DELETE_IMAGE_REGISTRY,
      },
      headers: {
        authorization: user2AccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Delete image registry", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "deleteImageRegistry",
        variables: {
          imageRegistryID: imageRegistryID,
          projectID: adminProjectId,
        },
        query: DELETE_IMAGE_REGISTRY,
      },
      headers: {
        authorization: adminAccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.deleteImageRegistry");
    });
  });
});
