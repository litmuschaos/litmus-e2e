/// <reference types="Cypress" />

Cypress.Commands.add('loginServer',(loginStatus)=>{
    cy.server();
    cy.route({
        method: 'POST',
        url: '/auth/login',
        status: loginStatus,
        response: (loginStatus==503)?'':{} 
    });
})

Cypress.Commands.add('modalServer',(modalStatus)=>{
    cy.server();
    cy.route({
        url:'/auth/update',
        method: 'POST',
        status: modalStatus,
        response: (modalStatus==503)?'':{email: "Vedant@Gmail.com",name: "Vedant"}
    })
})

Cypress.Commands.add('welcomeModalInputs',(ProjectName,Email,Password)=>{
    cy.get('[data-cy=inputProjectEmail] input').type(ProjectName);
    cy.get('[data-cy=Welcome-continue]').click();
    cy.get('[data-cy=inputProjectName] input').type(Email)
    cy.get('[data-cy=Welcome-continue]').click();
    cy.get('[data-cy=inputProjectPassword]').type(Password);
    cy.get('[data-cy=selectProjectFinish]').click();
})

Cypress.Commands.add('loginInput',(Email,password)=>{
    cy.get('[data-cy=inputEmail] input').type(Email);
    cy.get('[data-cy=inputPassword] input').type(password);
})

Cypress.Commands.add('login',(Email,password)=>{
    cy.loginInput(Email,password);
    cy.get('[data-cy=loginButton]').click();
})