/// <reference types="Cypress" />

describe("Testing the routes functionality without Login [ Must redirect to Login Page ]",()=>{

    context("Testing Routes without login",()=>{

        ["workflow","homepage","community","unknown"].map((page)=>{
            it("Visiting the "+page+" page without login",()=>{
                cy.clearCookie('token');
                indexedDB.deleteDatabase('localforage');
                cy.visit("/"+page);
                cy.url().should('include','/login');
            })
        })
    })
})

describe("Testing the routes with login [Must redirect to known required page or 404 for unknown page]",()=>{
    before("Login in to Web App",()=>{
        indexedDB.deleteDatabase('localforage');
        cy.visit('/');
        cy.login("admin","litmus");
    });
    
    context("Testing routes functionality with login",()=>{
        ["workflow","homepage","community","Unknown"].map((page)=>{
            it("Visiting the "+page+" page after login",()=>{
                cy.visit("/"+page);
                cy.url().should('include','/'+page);
            })
        })
    })
})

