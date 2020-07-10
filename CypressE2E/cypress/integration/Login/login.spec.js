/// <reference types="Cypress" />

describe("Testing the Rechablity of Login page",()=>{
    
    it("Visiting the Login Page",()=>{
        cy.visit("/login");
        cy.log("Visited the Login page Successfully");
    });
    
})

