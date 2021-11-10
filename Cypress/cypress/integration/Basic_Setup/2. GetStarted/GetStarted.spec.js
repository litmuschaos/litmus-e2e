/// <reference types="Cypress" />
import * as user from "../../../fixtures/Users.json";

describe("Testing the accessibility of Getting Started Page", () => {
  before("Clearing local storage", () => {
    cy.clearCookie("litmus-cc-token");
    indexedDB.deleteDatabase("localforage");
    cy.visit("/");
    cy.login(user.AdminName, user.AdminPassword);
  });

  it("Visiting the getStarted page after Login", () => {
    cy.url().should("contain", "/getStarted");
    cy.log("Reached the getting started page Successfully");
  });

  it("Using getStarted page without inputting only one password", () => {
    cy.get("[data-cy=inputPassword] input").clear().type(" ");
    cy.get("[data-cy=finishButton] button").should("be.disabled");
  });

  it("Using getStarted by inputting both password fields as empty", () => {
    cy.get("[data-cy=inputPassword] input").clear();
    cy.get("[data-cy=confirmInputPassword] input").clear();
    cy.get("[data-cy=finishButton] button").should("be.disabled");
  });

  it("Using getStarted by inputting both password fields different", () => {
    cy.get("[data-cy=inputPassword] input").clear().type(user.AdminPassword);
    cy.get("[data-cy=confirmInputPassword] input").clear().type("litmus1");
    cy.contains("Password is not same").should("be.visible");
    cy.get("[data-cy=finishButton] button").should("be.disabled");
  });

  it("Using getStarted by inputting both password fields correctly", () => {
    cy.get("[data-cy=inputPassword] input").clear().type(user.AdminPassword);
    cy.get("[data-cy=confirmInputPassword] input")
      .clear()
      .type(user.AdminPassword);
    cy.get("[data-cy=finishButton] button").should("be.enabled");
    cy.get("[data-cy=finishButton] button").click();
    cy.url().should("contain", "/home");
  });
});
