///  Validate stats for recurring 

Cypress.Commands.add("validateRecurringStats", () => {
    cy.wait(1000);
    cy.get("[data-cy=statsHeatMap]")
        .within((el) => {
            cy.wrap(el)
                .find('[fill="#109B67"]')
                .click();
        });

    cy.wait(1000);
    cy.get("[data-cy=statsBarGraph")
        .within((el) => {
            cy.wrap(el)
                .find('g')
                .find('rect')
                .eq(2)
                .click();
        });
});