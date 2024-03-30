// Custom function for login
Cypress.Commands.add('login', (Username,Password) => {
    cy.visit('/login');
    cy.get('input[name="username"]').type(Username);
    cy.get('input[name="password"]').type(Password);
    cy.get('.bp3-button').click({ });
    cy.wait(1000);
    cy.url().should('include','/dashboard');
  });

// Custom function for login through APIs for setting accessToken and projectID
Cypress.Commands.add("requestLogin", (loginName, loginPassword) => {
  localStorage.clear();
  cy.request({
    method: "POST",
    url: "auth/login",
    body: {
      username: loginName,
      password: loginPassword,
    },
  })
    .its("body")
    .then((response) => {
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem('projectID', response.projectID);
    });
});