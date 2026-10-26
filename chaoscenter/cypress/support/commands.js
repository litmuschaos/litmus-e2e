// Custom function for login
Cypress.Commands.add('login', (Username,Password) => {
    cy.visit('/login');
    cy.get('input[name="username"]').type(Username);
    cy.get('input[name="password"]').type(Password);
    cy.intercept('POST','auth/login').as('login');
    cy.interceptGraphQL('getInfraStats', 'infraStats');
    cy.get('button[type="submit"]').click({ });
    cy.wait('@login').its('response.statusCode').should('eq', 200);
    cy.url().should('include','/dashboard');
    cy.closeWelcomeDialog('@infraStats');
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


// ChaosCenter forces a password change at the first login: the UI redirects to the password reset page and the
// API answers "Unauthorized" until it is done. Changes the initial password of the admin to the one of the suite,
// it does nothing when that was already done.
Cypress.Commands.add('ensureAdminPassword', () => {
  const { username, password, initialPassword } = Cypress.env();
  cy.request({ method: 'POST', url: 'auth/login', failOnStatusCode: false, body: { username, password: initialPassword } }).then((initial) => {
    if (initial.status === 200 && initialPassword !== password) {
      cy.request({
        method: 'POST',
        url: 'auth/update/password',
        headers: { Authorization: `Bearer ${initial.body.accessToken}` },
        body: { username, oldPassword: initialPassword, newPassword: password },
      }).its('status').should('eq', 200);
    }
  });
  // the password of the suite has to work, whatever state the installation was in
  cy.request({ method: 'POST', url: 'auth/login', failOnStatusCode: false, body: { username, password } }).then((res) => {
    expect(res.status, 'login of ' + username + ' with the password of the suite').to.equal(200);
  });
});


// An installation without chaos infrastructure opens a dialog on the overview ("Enable chaos infrastructure to run
// your first chaos experiment"), its backdrop covers the whole page until it is closed. Waits for the infrastructure
// statistics of the overview (alias of interceptGraphQL('getInfraStats')) and closes the dialog when it is there.
Cypress.Commands.add('closeWelcomeDialog', (alias) => {
  cy.wait(alias).then(({ response }) => {
    if (response.body.data.getInfraStats.totalInfrastructures === 0) {
      cy.get('.bp3-dialog').should('be.visible');
      cy.get('body').type('{esc}');
      cy.get('.bp3-dialog').should('not.exist');
    }
  });
});

// Opens the overview of a logged in user
Cypress.Commands.add('openDashboard', () => {
  cy.interceptGraphQL('getInfraStats', 'overviewInfraStats');
  cy.visit('/dashboard');
  cy.closeWelcomeDialog('@overviewInfraStats');
});
