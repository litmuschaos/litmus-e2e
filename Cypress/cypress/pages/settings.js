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

//Custom command for changing password.
Cypress.Commands.add(
  "changePassword",
  (currPassword, newPassword, confPasword) => {
    cy.intercept("POST", Cypress.env("authURL") + "/update/password").as(
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
  }
);

//Custom command for checking header details.
Cypress.Commands.add("headerCheck", (name, email) => {
  cy.get("[data-cy=full-name]").should("contain", name);
  cy.get("[data-cy=headerProfileDropdown]").click();
  cy.get("[data-cy=name-header]").should("contain", name);
  email === ""
    ? cy.get("[data-cy=email-header]").should("contain", "")
    : cy.get("[data-cy=email-header]").should("contain", email);
  cy.root().click();
});
