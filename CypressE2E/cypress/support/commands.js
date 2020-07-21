/// <reference types="Cypress" />

//This Script provides custom commands for tests.

/* loginServer() command for stubbing a server 
with /auth/login route with any status code provided as argument.*/
Cypress.Commands.add('loginServer',(loginStatus)=>{
    cy.server();
    cy.route({
        method: 'POST',
        url: '/auth/login',
        status: loginStatus,
        response: (loginStatus==503)?'':{} 
    });
})

/* modalServer() command for stubbing a server 
with /auth/update route with any status code provided as argument.*/
Cypress.Commands.add('modalServer',(modalStatus)=>{
    cy.server();
    cy.route({
        url:'/auth/update',
        method: 'POST',
        status: modalStatus,
        response: (modalStatus==503)?'':{email: "Vedant@Gmail.com",name: "Vedant"}
    })
})

// Custom command for Inputting details in Welcome Modal.
Cypress.Commands.add('welcomeModalInputs',(ProjectName,Email,Password)=>{
    cy.get('[data-cy=inputProjectEmail] input').type(ProjectName);
    cy.get('[data-cy=Welcome-continue]').click();
    cy.get('[data-cy=inputProjectName] input').type(Email)
    cy.get('[data-cy=Welcome-continue]').click();
    cy.get('[data-cy=inputProjectPassword]').type(Password);
    cy.get('[data-cy=selectProjectFinish]').click();
})

//Command for inputting details and login.
Cypress.Commands.add('login',(Email,password)=>{
    cy.get('[data-cy=inputEmail] input').type(Email);
    cy.get('[data-cy=inputPassword] input').type(password);
    cy.get('[data-cy=loginButton]').click();
})