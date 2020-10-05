/// <reference types="Cypress" />

let user;
describe("Testing the accessibility of Welcome Modal",()=>{

    before("Clearing local storage",()=>{
        cy.clearCookie('token');
        indexedDB.deleteDatabase('localforage');
        cy.fixture("Users").then(User=>{
            user = User;
        });
        cy.requestLogin();
    });

    beforeEach("Refreshing page",()=>{
        cy.visit("/");
    })

    it("Visiting the Welcome Modal after Login",()=>{
        cy.contains('Welcome to Litmus Portal').should('be.visible');
        cy.log("Reached the Welcome Modal Successfully");
    });

    it("Using Modal without inputting any details",()=>{
        cy.get('[data-cy=InputProjectName] input').type(' ');
        cy.get('[data-cy=Continue]').click();
        cy.contains('Congratulations').should('not.be.visible');
    });

    it("Using Modal by partially inputting details",()=>{
        cy.welcomeModalInputs(user.projectname,user.AdminName,user.AdminPassword,' ');
        cy.contains('Congratulations').should('not.be.visible');
    });
    
    it("Using Modal by inputting all details",()=>{
        cy.welcomeModalInputs(user.projectname,user.AdminName,user.AdminPassword,user.AdminEmail);
        cy.contains('Congratulations').should('be.visible');
    });

})


