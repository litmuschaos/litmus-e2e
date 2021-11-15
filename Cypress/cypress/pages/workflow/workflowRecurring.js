///  Validate stats for recurring 

Cypress.Commands.add("validateRecurringStats", () => {
    cy.get("[data-cy=statsHeatMap]")
        .within(($div) => {
            cy.waitUntil(() => {
                    return $div.find("[data-cy=statsHeatMapLoader]");
                },
                {
                    verbose: true,
                    interval: 500,
                    timeout: 60000,
                }
            );
        });
    cy.get("[data-cy=statsHeatMap]")
        .within((el) => {
            cy.wrap(el)
                .find('[fill="#109B67"]')
                .click();
        });

    cy.get("[data-cy=statsBarGraphDiv]")
        .within(($div) => {
            cy.waitUntil(() => {
                    return $div.find("[data-cy=statsBarGraphLoader]");
                },
                {
                    verbose: true,
                    interval: 500,
                    timeout: 60000,
                }
            );
        });
    cy.get("[data-cy=statsBarGraph")
        .within((el) => {
            cy.wrap(el)
                .find('g')
                .find('rect')
                .eq(2)
                .click();
        });
});