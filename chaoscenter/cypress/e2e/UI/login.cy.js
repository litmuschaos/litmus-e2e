describe('Testing login page of chaoscenter via UI', () => {
  it('Login with correct username and password', () => {
      cy.login(Cypress.env('username'),Cypress.env('password'));
  });

  it('Negative test case[Login with incorrect username and password]', () => {
      cy.visit('/login');
      cy.get('input[name="username"]').type('invalid_user');
      cy.get('input[name="password"]').type('invalid_password');
      cy.intercept('POST','auth/login').as('login');
      cy.get('button[type="submit"]').click();
      cy.wait('@login').then(({ response }) => {
          expect(response.statusCode).to.equal(401);
          expect(response.body.error).to.equal('invalid_credentials');
      });
      cy.url().should('include','/login');
  });
});