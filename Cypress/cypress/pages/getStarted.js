/// ************************* Getting Started Page ***************************

Cypress.Commands.add("getStarted", (newPassword) => {
  cy.get("[data-cy=inputPassword] input").clear().type(newPassword);
  cy.get("[data-cy=confirmInputPassword] input").clear().type(newPassword);
  cy.intercept({
    url: Cypress.env("authURL") + "/update/details",
  }).as("onboarding");
  cy.get("[data-cy=finishButton] button").click();
  cy.wait("@onboarding").its("response.statusCode").should("eq", 200);
});
