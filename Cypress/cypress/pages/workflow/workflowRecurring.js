///  Validate stats for recurring 

Cypress.Commands.add("validateRecurringStats", () => {
    cy.get("[data-cy=statsHeatMap]")
        .then(($div) => {
            if ($div.find("[data-cy=statsHeatMapLoader]"))
                return false;
            else
                return true;
        }),
        {
            verbose: true,
            interval: 500,
            timeout: 60000,
        }
    cy.get("[data-cy=statsHeatMap]")
        .within((el) => {
            cy.wrap(el)
                .find('[fill="#109B67"]')
                .click();
        });

    cy.get("[data-cy=statsBarGraphDiv]")
        .then(($div) => {
            if ($div.find("[data-cy=statsBarGraphLoader]"))
                return false;
            else
                return true;
        }),
        {
            verbose: true,
            interval: 500,
            timeout: 60000,
        }
    cy.get("[data-cy=statsBarGraph")
        .within((el) => {
            cy.wrap(el)
                .find('g')
                .find('rect')
                .eq(2)
                .click();
        });
});