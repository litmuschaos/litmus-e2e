/// <reference types="Cypress" />

describe("Testing the accessibility of Community page",()=>{
    
    it("Visiting the Community page",()=>{
        cy.loginServer(200);
        indexedDB.deleteDatabase('localforage');
        cy.visit('/login');
        cy.login('Vedant','Litmus');
        cy.modalServer(200);
        cy.welcomeModalInputs('Litmus','Litmus@mayadata.io','1234');
        cy.visit('/community');
        cy.url().should('include','/community');
        cy.log("Visited the community page Successfully");
    });
})

