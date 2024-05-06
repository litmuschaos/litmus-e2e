describe('Testing login page of chaoscenter via REST APIs', () => {
  it('testing login via REST API', () => {
    cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
  });

  it('Negative test case[Login with incorrect username and password]', () => {
    cy.request({
      method: "POST",
      url: "auth/login",
      failOnStatusCode: false,
      body: {
          username: 'invalid_user',
          password: 'invalid_password',
      },
  }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal('user does not exist');
  });
  })
});