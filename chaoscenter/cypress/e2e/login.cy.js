describe('Testing login page of chaoscenter', () => {

  it('testing with invalid data', () => {
    cy.visit('/login');
    cy.get('input[name="username"]').type('invalid_user');
    cy.get('input[name="password"]').type('invalid_password');
    cy.get('.bp3-button').click();
    cy.on('window:alert', (message) => {
      expect(message).to.equal('user does not exist');
    });
  });
  
  it('testing login with valid data', () => {
    cy.login(Cypress.env('username'),Cypress.env('password'));
  });

  it('testing login thorugh REST API', () => {
    cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
  })
})