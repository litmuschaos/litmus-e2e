/// ************************* Getting Started Page ***************************

Cypress.Commands.add("getStarted", (newPassword, projectName) => {
  cy.get("[data-cy=inputPassword] input").clear().type(newPassword);
  cy.get("[data-cy=confirmInputPassword] input").clear().type(newPassword);
  cy.get("[data-cy=finishButton] button").click();
});
