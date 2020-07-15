/// <reference types="Cypress" />

describe("Testing the 404 route functionality",()=>{

    beforeEach("First loging in on login Page",()=>{
        cy.visit("/login");
        cy.get('[data-cy=inputEmail] input').type("User@gamil.com");
        cy.get('[data-cy=inputPassword] input').type("Hii");
        cy.get('[data-cy=loginButton]').click()
    })

    context("Testing Routes after clearing cookies",()=>{
        ["workflow","home","community"].map((page)=>{
            it("Visiting the "+page+" page",()=>{
                cy.visit("/"+page);
            })
        })
    })

    it("Visiting an unkknown page",()=>{
        cy.visit("/hii");
        cy.url().should("include","404");
    })

})

