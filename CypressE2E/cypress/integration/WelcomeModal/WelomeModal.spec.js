/// <reference types="Cypress" />

describe("Testing the Rechability of Welcome Modal",()=>{
    it("Visiting the Welcome Modal after Login",()=>{
        cy.loginServer(200);
        cy.visit('/login');
        cy.login('Vedant','Litmus');
        cy.contains('Welcome to Litmus Portal').should('be.visible');
        cy.log("Reached the Welcome Modal Successfully");
        indexedDB.deleteDatabase('localforage');
    })
})

describe("Testing the Functionality of Welcome Modal",()=>{
    beforeEach("Visiting the Welcome Modal",()=>{
        cy.loginServer();
        cy.visit('/login');
        cy.login('Vedant','1234');
    })

    afterEach('Deleting the database from indexed DB',()=>{
        indexedDB.deleteDatabase('localforage');
    })

    it("Using Modal without inputting any details",()=>{
        cy.modalServer('503');
        cy.welcomeModalInputs(' ',' ',' ');
        cy.contains('Congratulations').should('not.be.visible');
    })

    it("Using Modal by partially inputting details",()=>{
        cy.modalServer(503);
        cy.welcomeModalInputs('Project','Litmus@mayadata.io',' ');
        cy.contains('Congratulations').should('not.be.visible');
    })
    
    it("Using Modal by inputting all details",()=>{
        cy.modalServer(200);
        cy.welcomeModalInputs('Project','Litmus@mayadata.io','1234');
        cy.contains('Congratulations').should('be.visible');
    })
})


