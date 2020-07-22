/// <reference types="Cypress" />

describe("Testing the accessibility of Login page",()=>{
    
    it("Visiting the Login Page",()=>{
        indexedDB.deleteDatabase('localforage');
        cy.visit("/login");
        cy.url().should('include','/login');
        cy.log("Visited the Login page Successfully");
    });

})

describe("Checking functionality of Login Page",()=>{
   
    beforeEach("Visit Login Page",()=>{
        cy.visit('/login');
    })
  
    it("Checking Input areas functionallity",()=>{
        cy.login("Vedant","Litmus");
        cy.get("[name=username]").should("have.value","Vedant");
        cy.get("[name=password]").should("have.value","Litmus");
    })

    it("Testing the only single input sign in [ Should not be possible ]",()=>{
        cy.loginServer(503);
        cy.login("Vedant"," ");
        cy.url().should('include','/login');
        cy.get('[name=username]').clear();
        cy.get('[name=password]').clear();
        cy.login(" ","Litmus");
        cy.url().should('include','/login');
    })

    it("Testing with wrong details [ Should not be possible ]",()=>{
        cy.loginServer(503);
        cy.login("Vedant","Litmus");
        cy.url().should('include','/login');
    })

    it("Testing with without any details [ Should not be possible ]",()=>{
        cy.loginServer(503);
        cy.login(" "," ");
        cy.url().should('include','/login');
    })

    it("Testing with Correct details [ Must redirect to Welcome modal ]",()=>{
        cy.loginServer(200);
        cy.login("Vedant","Litmus");
        cy.contains("Welcome to Litmus Portal");
        indexedDB.deleteDatabase('localforage');
    })
})

