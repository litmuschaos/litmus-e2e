describe('Testing login page of chaoscenter', () => {
  it('testing login with valid data', () => {
    cy.login(Cypress.env('username'),Cypress.env('password'));
  });

  it('testing login thorugh REST API', () => {
    cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
  });
});