/// <reference types="Cypress" />
let user;
describe("Testing the accessibility of Community page", () => {
  it("Visiting the Community page", () => {
    cy.fixture("Users").then((User) => {
      user = User;
      cy.requestLogin(user.AdminName, user.AdminPassword);
    });
    cy.wait(8000);
    cy.visit("/community");
    cy.url().should("include", "/community");
    cy.log("Visited the community page Successfully");
  });
});
