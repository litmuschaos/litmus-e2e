/// <reference types="Cypress" />

let user;
describe("Testing the accessibility of Login page",()=>{
    
    it("Visiting the Login Page",()=>{
        cy.clearCookie('token');
        indexedDB.deleteDatabase('localforage');
        cy.visit("/login");
        cy.url().should('include','/login');
        cy.log("Visited the Login page Successfully");
    });
})

describe("Checking functionality of Login Page",()=>{
   
    beforeEach("Visit Login Page",()=>{
        cy.clearCookie('token');
        indexedDB.deleteDatabase('localforage');
        cy.fixture("Users").then(User=>{
            user = User;
        });
        cy.visit('/login');
    })
  
    it("Testing the only single input sign in [ Should not be possible ]",()=>{
        cy.login(user.AdminName," ");
        cy.url().should('include','/login');
        cy.get('[data-cy=inputName] input').clear();
        cy.get('[data-cy=inputPassword] input').clear();
        cy.login(" ",user.AdminPassword);
        cy.contains("Wrong Credentials").should('be.visible');
    })

    it("Testing with wrong details [ Should not be possible ]",()=>{
        cy.login("john","1234");
        cy.url().should('include','/login');
        cy.contains("Wrong Credentials").should('be.visible');
    })

    it("Testing with without any details [ Should not be possible ]",()=>{
        cy.login(" "," ");
        cy.url().should('include','/login');
        cy.contains("Wrong Credentials").should('be.visible');
    })

    it("Testing with Correct details [ Must redirect to Welcome modal ]",()=>{
        cy.login(user.AdminName,user.AdminPassword);
        cy.contains("Welcome to Litmus Portal");
    })
})

