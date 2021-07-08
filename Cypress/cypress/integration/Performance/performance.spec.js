import * as user from "../../fixtures/Users.json";

describe('Lighthouse', () => {
  before("Clearing the Cookies and deleting the Cookies", () => {
    cy.requestLogin(user.AdminName, user.AdminPassword);
    cy.waitForCluster("Self-Agent");
    cy.visit("/create-workflow");
  });

  it('should run performance audits', () => {    
    cy.lighthouse();
  });
});