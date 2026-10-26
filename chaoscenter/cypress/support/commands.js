// Custom function for login
Cypress.Commands.add('login', (Username,Password) => {
    cy.visit('/login');
    cy.get('input[name="username"]').type(Username);
    cy.get('input[name="password"]').type(Password);
    cy.intercept('POST','auth/login').as('login');
    cy.get('button[type="submit"]').click({ });
    cy.wait('@login').its('response.statusCode').should('eq', 200);
    cy.url().should('include','/dashboard');
  });

// Custom function for login through APIs for setting accessToken and projectID
Cypress.Commands.add("requestLogin", (loginName, loginPassword) => {
  cy.request({
    method: "POST",
    url: "auth/login",
    body: {
      username: loginName,
      password: loginPassword,
    },
  }).then((response) => {
      expect(response.status).to.equal(200);
      localStorage.setItem("accessToken", response.body.accessToken);
      localStorage.setItem('projectID', response.body.projectID);
    });
});

// Registers an alias for the GraphQL request of the given operation sent by the UI.
// It has to be called before the action which triggers the request.
Cypress.Commands.add('interceptGraphQL', (operationName, alias) => {
  cy.intercept('POST', '**/api/query', (req) => {
    const { operationName: name, query } = req.body || {};
    if (name === operationName || (typeof query === 'string' && query.includes(operationName))) {
      req.alias = alias;
    }
  });
});

// Waits for the aliased GraphQL request and fails the test unless the operation succeeded
Cypress.Commands.add('expectGraphQLSuccess', (alias) => {
  cy.wait(`@${alias}`).then(({ response }) => {
    expect(response.statusCode, 'HTTP status').to.equal(200);
    expect(response.body.errors, 'GraphQL errors').to.equal(undefined);
  });
});

// Waits for the aliased GraphQL request and fails the test unless the operation returned the expected error
Cypress.Commands.add('expectGraphQLError', (alias, message) => {
  cy.wait(`@${alias}`).then(({ response }) => {
    expect(response.body.errors, 'GraphQL errors').to.have.length.greaterThan(0);
    expect(response.body.errors[0].message).to.contain(message);
  });
});
