/// <reference types="Cypress" />
//This Script provides custom commands for tests.
/* loginServer() command for stubbing a server 
with /auth/login route with any status code and login details provided as argument.*/
Cypress.Commands.add("loginServer", (loginStatus, email, password) => {
  cy.server();
  cy.route({
    method: "POST",
    url: Cypress.env("authURL") + "/login",
    status: loginStatus,
    response: loginStatus == 503 ? "" : {},
  }).as("login");
  cy.login(email, password);
  cy.wait("@login");
});

/* modalServer() command for stubbing a server 
with /auth/update route with any status code provided as argument.*/
Cypress.Commands.add(
  "modalServer",
  (modalStatus, ProjectName, Name, Email, Password) => {
    cy.server();
    cy.route({
      url: Cypress.env("authURL") + "/update/details",
      method: "POST",
      status: modalStatus,
      response:
        modalStatus == 503 ? "" : { email: "Vedant@Gmail.com", name: "Vedant" },
    }).as("updateDetails");
    cy.welcomeModalInputs(ProjectName, Name, Email, Password);
    cy.wait("@updateDetails");
  }
);

// Custom command for Inputting details in Welcome Modal.
Cypress.Commands.add(
  "welcomeModalInputs",
  (ProjectName, Name, Password, Email) => {
    cy.get("[data-cy=InputProjectName] input").clear().type(ProjectName);
    cy.get("[data-cy=Continue]").click();
    cy.get("[data-cy=InputName] input").clear().type(Name);
    cy.get("[data-cy=startButton]").eq(0).click();
    cy.get("[data-cy=InputPassword] input").each(($div) => {
      cy.wrap($div).type(Password);
    });
    cy.get("[data-cy=startButton]").eq(0).click();
    cy.get("[data-cy=InputEmail] input").clear().type(Email);
    cy.get("[data-cy=startButton]").eq(0).click();
  }
);

//Custom command for Inputting Login Details.
Cypress.Commands.add("login", (Username, Password) => {
  cy.get("[data-cy=inputName] input").type(Username);
  cy.get("[data-cy=inputPassword] input").type(Password);
  cy.get("[data-cy=loginButton]").click();
});

//Custom command for Logut.
Cypress.Commands.add("logout", () => {
  cy.get("[data-cy=header-dropdown]").click();
  cy.get("[data-cy=logout]").click();
});

//Custom command for changing password.
Cypress.Commands.add(
  "changePassword",
  (currPassword, newPassword, confPasword) => {
    cy.server();
    cy.route("POST", Cypress.env("authURL") + "/update/password").as(
      "passwordResponse"
    );
    currPassword === ""
      ? cy.get("[data-cy=currPassword] input").clear()
      : cy.get("[data-cy=currPassword] input").clear().type(currPassword);
    newPassword === ""
      ? cy.get("[data-cy=newPassword] input").clear()
      : cy.get("[data-cy=newPassword] input").clear().type(newPassword);
    confPasword === ""
      ? cy.get("[data-cy=confPassword] input").clear()
      : cy.get("[data-cy=confPassword] input").clear().type(confPasword);
    cy.get("[data-cy=change-password]").click();
  }
);

//Custom command for closing modal.
Cypress.Commands.add("modalClose", () => {
  cy.get("[data-cy=done]").should("be.visible");
  cy.get("[data-cy=done]").click();
});

//Custom command for checking header details.
Cypress.Commands.add("headerCheck", (name, email) => {
  cy.get("[data-cy=full-name]").should("contain", name);
  cy.get("[data-cy=header-dropdown]").click();
  cy.get("[data-cy=name-header]").should("contain", name);
  email === ""
    ? cy.get("[data-cy=email-header]").should("contain", "")
    : cy.get("[data-cy=email-header]").should("contain", email);
  cy.root().click();
});

// Custom function for logging In & setting token without using UI
Cypress.Commands.add("requestLogin", (loginName, loginPassword) => {
  cy.clearCookie("token");
  indexedDB.deleteDatabase("localforage");
  cy.request({
    method: "POST",
    url: Cypress.env("authURL") + "/login",
    body: {
      username: loginName,
      password: loginPassword,
    },
  })
    .its("body")
    .then((res) => {
      cy.setCookie("token", res.access_token);
    });
    cy.visit("/");
});

//Custom command for Inputting user Details.
Cypress.Commands.add("createUser", (Name, Email, Username, Password) => {
  Name === ""
    ? cy.get("[data-cy=InputName] input").clear()
    : cy.get("[data-cy=InputName] input").clear().type(Name);
  Email === ""
    ? cy.get("[data-cy=InputEmail] input").clear()
    : cy.get("[data-cy=InputEmail] input").clear().type(Email);
  Username === ""
    ? cy.get("[data-cy=username] input").clear()
    : cy.get("[data-cy=username] input").clear().type(Username);
  Password === ""
    ? cy.get("[data-cy=passwordInput] input").clear()
    : cy.get("[data-cy=passwordInput] input").clear().type(Password);
});