/// <reference types="Cypress" />

describe("Testing the routes functionality without Login [ Must redirect to Login Page ]",()=>{

    context("Testing Routes without login",()=>{

        ["workflow","homepage","community"].map((page)=>{
            it("Visiting the "+page+" page without login",()=>{
                indexedDB.deleteDatabase('localforage');
                cy.visit("/"+page);
                cy.url().should('include','/login');
            })
        })
    })

    it("Visiting an unknown page without login",()=>{
        indexedDB.deleteDatabase('localforage');
        cy.visit("/hii");
        cy.url().should("include","/login");
    })
})

describe("Testing the routes with login",()=>{
    before("Login in to Web App",()=>{
        cy.loginServer(200);
        cy.visit('/login');
        cy.login('Vedant','Litmus');
    })

    after("Deleting the database from Indexed DB",()=>{
        indexedDB.deleteDatabase('localforage');
    })

    context("Testing routes functionality with login",()=>{
        ["workflow","homepage","community"].map((page)=>{
            it("Visiting the "+page+" page after login",()=>{
                cy.visit("/"+page);
                cy.url().should('include','/'+page);
            })
        })

        it("Visiting an unknown page",()=>{
            cy.visit('/hii');
            cy.url().should('include','/404');
        })
    })
})

