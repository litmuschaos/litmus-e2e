describe('Testing login page of chaoscenter via UI', () => {
  it('Login with correct username and password', () => {
      cy.login(Cypress.env('username'),Cypress.env('password'));
  });

  it('Negative test case[Login with incorrect username and password]', () => {
      cy.visit('/login');
      cy.get('input[name="username"]').type('invalid_user');
      cy.get('input[name="password"]').type('invalid_password');
      cy.get('button[type="submit"]').click();
      cy.on('window:alert', (message) => {
          expect(message).to.equal('user does not exist');
      });
  });
});