/// <reference types="Cypress" />

describe("Testing the create Workflow Utility",()=>{
    
    before("Clearing the Cookies and deleting the ",()=>{
        cy.clearCookies();
        indexedDB.deleteDatabase('localforage');
        cy.requestLogin();
        cy.visit('/');
        cy.wait(8000); // Needs to be removed after frontend is fixed.
    });

    it("Checking the accessibility of the Create-Workflow Page",()=>{
        cy.visit('/create-workflow');
        cy.url().should('contain','/create-workflow');
        cy.contains('Choose the target Kubernetes Agent').should('be.visible');
    });
})
