/// <reference types="Cypress" />
let user;

describe("Testing the My accounts section", () => {
  before("Clearing local storage", () => {
    cy.clearCookie("token");
    indexedDB.deleteDatabase("localforage");
    cy.fixture("Users").then(User=>{
      user = User;
    });
    cy.requestLogin();
    cy.visit("/");
    cy.contains("Congratulations").should("be.visible"); // confirmation of HomePage loaded.
  });

  it("Checking the accessibility of the Settings", () => {
    cy.contains("Settings").click();
    cy.contains("My Account").should("be.visible");
  });

  it("Checking the accessibility of My Accounts", () => {
    cy.get("[data-cy=my-account]").click();
    cy.contains("Personal Details").should("be.visible");
  });

  it("Changing the personal details by inputting all details", () => {
    cy.server();
    cy.route("POST", "/api/query").as("detailsResponse");
    cy.get("[data-cy=InputName] input").clear().type(user.NewName);
    cy.get("[data-cy=InputEmail] input").clear().type(user.NewEmail);
    cy.get("[data-cy=save]").click();
    cy.wait("@detailsResponse").its("status").should("eq", 200); //Request Done.
    cy.modalClose();
    cy.get("[data-cy=done]").should("not.exist");
    cy.headerCheck(user.NewName, user.NewEmail);
  });

  it("Changing the personal details with empty email field", () => {
    cy.server();
    cy.route("POST", "/api/query").as("detailsResponse");
    cy.get("[data-cy=InputName] input").clear().type(user.NewName);
    cy.get("[data-cy=InputEmail] input").clear();
    cy.get("[data-cy=save]").click();
    cy.wait("@detailsResponse").its("status").should("eq", 200); //Request Done.
    cy.modalClose();
    cy.headerCheck(user.NewName, "");
  });

  it("Changing the personal details with empty fullname field", () => {
    cy.get("[data-cy=InputName] input").clear();
    cy.get("[data-cy=InputEmail] input").clear().type(user.NewEmail);
    cy.get("[data-cy=save] button").should("be.disabled");
  });

  it("Changing the password by inputting any two/none of the three password fields", () => {
    cy.log("with empty current password");
    cy.changePassword("", "litmus@123", "litmus@123");
    cy.get("[data-cy=change-password] button").should("be.disabled");
    cy.log("with empty new password");
    cy.changePassword("litmus@123", "", "litmus");
    cy.get("[data-cy=change-password] button").should("be.disabled");
    cy.log("with empty confirm password");
    cy.changePassword("litmus", "litmus@123", "");
    cy.get("[data-cy=change-password] button").should("be.disabled");
    cy.log("with all empty fields");
    cy.changePassword("", "", "");
    cy.get("[data-cy=change-password] button").should("be.disabled");
  });

  it("Changing the password by inputting incorrect current password", () => {
    cy.changePassword("abc", user.NewPassword, user.NewPassword);
    cy.wait("@passwordResponse").its("status").should("eq", 401); //Request Done.
    cy.contains("Error").should("be.visible");
    cy.modalClose();
    cy.log(
      "User should be able to log in with older credentials as password did not change"
    );
    cy.logout();
    cy.server();
    cy.route("POST", "/auth/login").as("loginResponse"); //Alias for Login Route
    cy.login(user.AdminName, user.AdminPassword);
    cy.wait("@loginResponse").its("status").should("eq", 200); //Request Done.
    cy.contains("Congratulations").should("be.visible"); //confirmation of HomePage loaded.
  });


  // it("Changing the password by inputting all the three password fields", () => {
  //   cy.contains("Settings").click();
  //   cy.get("[data-cy=my-account]").click();
  //   cy.changePassword(user.AdminPassword, user.NewPassword, user.NewPassword);
  //   cy.wait("@passwordResponse").its("status").should("eq", 200); //Request Done.
  //   cy.modalClose();
  //   cy.get("[data-cy=done]").should("not.exist");
  //   cy.logout();
  //   cy.url().should("include", "/login");
  //   cy.server();
  //   cy.route("POST", "/auth/login").as("loginResponse"); //Alias for Login Route
  //   cy.login(user.AdminName, user.NewPassword);
  //   cy.wait("@loginResponse").its("status").should("eq", 200); //Request Done.
  //   cy.contains("Congratulations").should("be.visible"); //confirmation of HomePage loaded.
  //   cy.log("Reverting back the password to litmus");
  //   cy.contains("Settings").click();
  //   cy.changePassword(user.NewPassword, user.AdminPassword, user.AdminPassword);
  //   cy.wait("@passwordResponse").its("status").should("eq", 200); //Request Done.
  //   cy.modalClose();
  // });
});
