/// <reference types="Cypress" />

import * as user from "../../../fixtures/Users.json";
import * as imageRegistryInput from "../../../fixtures/imageRegistryInput.json";
import {
  ADD_IMAGE_REGISTRY,
  UPDATE_IMAGE_REGISTRY,
  DELETE_IMAGE_REGISTRY,
} from "../../../fixtures/graphql/mutations";
import { GET_IMAGE_REGISTRY } from "../../../fixtures/graphql/queries";

let project1Id, project2Id, imageRegistryID;
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

describe("Testing image registry api", () => {
  it("Create image registry by user with viewer access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "createImageRegistry",
        variables: {
          projectID: project1Id,
          imageRegistryInfo: imageRegistryInput.registry1,
        },
        query: ADD_IMAGE_REGISTRY,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Create image registry by user with no access", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "createImageRegistry",
        variables: {
          projectID: project1Id,
          imageRegistryInfo: imageRegistryInput.registry1,
        },
        query: ADD_IMAGE_REGISTRY,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Create image registry by user with admin access", () => {
    cy.logout();
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "createImageRegistry",
        variables: {
          projectID: project1Id,
          imageRegistryInfo: imageRegistryInput.registry1,
        },
        query: ADD_IMAGE_REGISTRY,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.createImageRegistry");
      imageRegistryID = res.body.data.createImageRegistry.imageRegistryID;
    });
  });

  it("Get image registry by user with viewer access", () => {
    cy.logout();
    cy.requestLogin(user.user3.username, user.user3.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getImageRegistry",
        variables: {
          projectID: project1Id,
          imageRegistryID: imageRegistryID,
        },
        query: GET_IMAGE_REGISTRY,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Get image registry by user with no access", () => {
    cy.logout();
    cy.requestLogin(user.user2.username, user.user2.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getImageRegistry",
        variables: {
          projectID: project1Id,
          imageRegistryID: imageRegistryID,
        },
        query: GET_IMAGE_REGISTRY,
        failOnStatusCode: false,
      },
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Get image registry by user with admin access", () => {
    cy.logout();
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getImageRegistry",
        variables: {
          projectID: project1Id,
          imageRegistryID: imageRegistryID,
        },
        query: GET_IMAGE_REGISTRY,
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
      expect(res.body.data.getImageRegistry.projectID).to.eq(project1Id);
    });
  });

  it("Update image registry by user with viewer access", () => {
    cy.logout();
    cy.requestLogin(user.user3.username, user.user3.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "updateImageRegistry",
        variables: {
          imageRegistryID: imageRegistryID,
          projectID: project1Id,
          imageRegistryInfo: imageRegistryInput.registry2,
        },
        query: UPDATE_IMAGE_REGISTRY,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Update image registry by user with no access", () => {
    cy.logout();
    cy.requestLogin(user.user2.username, user.user2.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "updateImageRegistry",
        variables: {
          imageRegistryID: imageRegistryID,
          projectID: project1Id,
          imageRegistryInfo: imageRegistryInput.registry2,
        },
        query: UPDATE_IMAGE_REGISTRY,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Update image registry by user with admin access", () => {
    cy.logout();
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "updateImageRegistry",
        variables: {
          imageRegistryID: imageRegistryID,
          projectID: project1Id,
          imageRegistryInfo: imageRegistryInput.registry2,
        },
        query: UPDATE_IMAGE_REGISTRY,
      },
    })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.nested.property("data.updateImageRegistry");
        return cy.request({
          method: "POST",
          url: Cypress.env("apiURL") + "/query",
          body: {
            operationName: "getImageRegistry",
            variables: {
              projectID: project1Id,
              imageRegistryID: imageRegistryID,
            },
            query: GET_IMAGE_REGISTRY,
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
        expect(res.body.data.getImageRegistry.projectID).to.eq(project1Id);
      });
  });

  it("Delete image registry by user with viewer access", () => {
    cy.logout();
    cy.requestLogin(user.user3.username, user.user3.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "deleteImageRegistry",
        variables: {
          imageRegistryID: imageRegistryID,
          projectID: project1Id,
        },
        query: DELETE_IMAGE_REGISTRY,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Delete image registry by user with no access", () => {
    cy.logout();
    cy.requestLogin(user.user2.username, user.user2.password);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "deleteImageRegistry",
        variables: {
          imageRegistryID: imageRegistryID,
          projectID: project1Id,
        },
        query: DELETE_IMAGE_REGISTRY,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Delete image registry", () => {
    cy.logout();
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "deleteImageRegistry",
        variables: {
          imageRegistryID: imageRegistryID,
          projectID: project1Id,
        },
        query: DELETE_IMAGE_REGISTRY,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.deleteImageRegistry");
    });
  });
});
