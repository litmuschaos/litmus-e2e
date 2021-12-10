/// <reference types="Cypress" />
let user;
describe("Testing the routes functionality without Login [ Must redirect to Login Page ]", () => {
  context("Testing Routes without login", () => {
    ["workflow", "homepage", "community", "unknown"].map((page) => {
      it("Visiting the " + page + " page without login", () => {
        cy.clearCookie("litmus-cc-token");
        indexedDB.deleteDatabase("localforage");
        cy.visit("/" + page);
        cy.url().should("include", "/login");
      });
    });
  });
});

describe("Testing the routes with login [Must redirect to known required page or 404 for unknown page]", () => {
  before("Login in to Web App", () => {
    indexedDB.deleteDatabase("localforage");
    cy.visit("/");
    cy.fixture("Users").then((User) => {
      user = User;
      cy.requestLogin(user.AdminName, user.AdminPassword);
    });
  });

  context("Testing routes functionality with login", () => {
    ["workflow", "homepage", "community"].map((page) => {
      it("Visiting the " + page + " page after login", () => {
        cy.visit("/" + page);
        cy.url().should("include", "/" + page);
      });
    });

    it("Testing unknown route", () => {
      cy.visit("/unknown");
      cy.url().should("include", "404");
    });
  });
});
