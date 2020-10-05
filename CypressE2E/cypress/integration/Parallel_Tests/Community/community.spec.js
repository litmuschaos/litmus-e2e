/// <reference types="Cypress" />

describe("Testing the accessibility of Community page",()=>{
    
    it("Visiting the Community page",()=>{
        cy.clearCookies();
        indexedDB.deleteDatabase('localforage');
        cy.requestLogin();
        cy.visit('/community');
        cy.url().should('include','/community');
        cy.log("Visited the community page Successfully");
    });
})

