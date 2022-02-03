///  Validate stats for recurring

Cypress.Commands.add("validateRecurringStats", () => {
  cy.get("[data-cy=statsHeatMap]").should("be.visible");
  cy.get("[data-cy=statsHeatMap]").within((el) => {
    cy.wrap(el).find('[fill="#109B67"]').click();
  });

  cy.get("[data-cy=statsBarGraph]").scrollIntoView();
  cy.get("[data-cy=statsBarGraph]").should("be.visible");
  cy.get("[data-cy=statsBarGraph").within((el) => {
    cy.wrap(el).find("g").find("rect").eq(2).click();
  });
});
