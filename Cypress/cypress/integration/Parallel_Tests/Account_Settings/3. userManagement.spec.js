/// <reference types="Cypress" />
import * as user from "../../../fixtures/Users.json";

describe("Testing the User management section", () => {
  before("Clearing local storage", () => {
    cy.clearCookie("token");
    indexedDB.deleteDatabase("localforage");
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.visit("/");
  });
  it("Checking the accessibility of the Settings", () => {
    cy.contains("Settings").click();
    cy.contains("User Management").should("be.visible");
  });
  it("Checking the accessibility of User Management", () => {
    cy.intercept("GET", Cypress.env("authURL") + "/users").as("userResponse");
    cy.get("[data-cy=user-management]").click();
    cy.wait("@userResponse").then((data) => {
      cy.wrap(data.response.body.length).should("gte", 1);
    });
  });
  it("Checking the accessibility of Create new user", () => {
    cy.get("[data-cy=createUser]").click();
    cy.contains("Create a new user").should("be.visible");
  });
  it("Creating user by inputting username and password", () => {
    cy.createUser("", "", "richard124", "litmus");
    cy.get("[data-cy=createNewUserButton] button").should("be.enabled");
  });
  it("Creating user by inputting full name and email", () => {
    cy.createUser("Richard Hill", "richard@gmail.com", "", "");
    cy.get("[data-cy=createNewUserButton] button").should("be.disabled");
  });
  it("Creating user by leaving full name empty", () => {
    cy.createUser("", "richard@gmail.com", "richard124", "litmus");
    cy.get("[data-cy=createNewUserButton] button").should("be.enabled");
  });
  it("Creating user by leaving email empty", () => {
    cy.createUser("Richard Hill", "", "richard124", "litmus");
    cy.get("[data-cy=createNewUserButton] button").should("be.enabled");
  });
  it("Creating user by inputting full name, email and password", () => {
    cy.createUser("Richard Hill", "richard@gmail.com", "", "litmus");
    cy.get("[data-cy=createNewUserButton] button").should("be.disabled");
  });
  it("Creating user by inputting full name, email and username", () => {
    cy.createUser("Richard Hill", "richard@gmail.com", "richard124", "");
    cy.get("[data-cy=createNewUserButton] button").should("be.disabled");
  });
  it("Creating user by inputting all details", () => {
    cy.intercept("POST", Cypress.env("authURL") + "/create").as(
      "createResponse"
    );
    cy.createUser("Richard Hill", "richard@gmail.com", "richard124", "litmus");
    cy.get("[data-cy=createNewUserButton]").click();
    cy.wait("@createResponse");
    cy.get("[data-cy=newUserDoneButton]").should("be.visible");
    cy.get("[data-cy=newUserDoneButton]").click();
    cy.contains("richard124").should("be.visible");
  });
  it("Creating user by inputting all details", () => {
    cy.get("[data-cy=searchField]").within(() => {
      cy.get("input").clear().type("richard124");
    });
    cy.get("[data-cy=userTableRow]").within(() => {
      cy.get("[data-cy=editUser]").first().click();
    });
    cy.get("[data-cy=editProfile]").click();
    cy.get("[data-cy=editPassword] input").clear().type("litmus@123");
    cy.intercept("POST", Cypress.env("authURL") + "/reset/password").as(
      "resetResponse"
    );
    cy.get("[data-cy=edit]").click();
    cy.wait("@resetResponse").its("response.statusCode").should("eq", 200);
    cy.get("[data-cy=done]").should("be.visible");
    cy.get("[data-cy=done]").click();
  });
  it("logging in from new user and checking the accesibility of non admin users", () => {
    cy.logout();
    cy.intercept("POST", Cypress.env("authURL") + "/login").as("loginResponse"); //Alias for Login Route
    cy.login("richard124", "litmus@123");
    cy.wait("@loginResponse").its("response.statusCode").should("eq", 200); //Request Done.
  });
});
