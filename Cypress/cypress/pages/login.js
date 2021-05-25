//// ******************** Login Page ********************************

//Custom command for Inputting Login Details.
Cypress.Commands.add("login", (Username, Password) => {
  cy.get("[data-cy=inputName] input").type(Username);
  cy.get("[data-cy=inputPassword] input").type(Password);
  cy.get("[data-cy=loginButton]").click();
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
