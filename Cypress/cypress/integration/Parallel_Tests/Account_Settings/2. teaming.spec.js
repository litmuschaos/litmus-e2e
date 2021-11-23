/// <reference types="Cypress" />
import { AdminName, AdminPassword } from "../../../fixtures/Users.json";
import { user1, user2 } from "../../../fixtures/teaming.json";

describe("Testing the Teaming section", () => {
  before("Clearing local storage", () => {
    cy.clearCookie("litmus-cc-token");
    indexedDB.deleteDatabase("localforage");
    cy.requestLogin(AdminName, AdminPassword);
  });

  it("Test case to check the accessibility of Teaming Tab", () => {
    cy.visit("/settings");
    cy.url().should("include", "/settings");
  });

  it("Test case to check the default Project Details of Teaming Tab", () => {
    cy.get("[data-cy=teaming]").should("be.visible");
    cy.get("[data-cy=teaming]").click();
    cy.get("[data-cy=toolBarComponent]").should("be.visible");
    cy.validateProjectsDetails({
      totalProjects: 1,
      ownedProjects: 1,
      invitationsRecieved: 0,
    });
  });

  it("Test case to check the Invitation Functionality (Invitation as a viewer)", () => {
    //Creating a new user for this test case
    cy.getCookie("litmus-cc-token").then((token) => {
      cy.request({
        method: "POST",
        url: Cypress.env("authURL") + "/create",
        body: {
          email: "",
          username: user1.username,
          name: "",
          password: user1.password,
          role: "user",
        },
        headers: {
          authorization: `Bearer ${token.value}`,
        },
      })
        .its("status")
        .should("eq", 200);
    });

    cy.logout();

    // //Login as the intivation receipent
    cy.requestLogin(user1.username, user1.password);
    cy.getStarted(user1.password);
    cy.validateScaffold();
    cy.logout();

    // //Login again as Admin to confirm that member has been added.
    cy.requestLogin(AdminName, AdminPassword);

    //Visit the teaming section and invite the newly created user as viewer"
    cy.visit("/settings");
    cy.get("[data-cy=teaming]").should("be.visible").click();
    cy.get("[data-cy=toolBarComponent]").should("be.visible");
    cy.inviteUser(user1.username, user1.role);

    //Check if invitation got sent in the "Sent Tab"
    cy.get("[data-cy=invitedTab]")
      .find("span")
      .eq(0)
      .should("have.text", "1 Invited");
    cy.get("[data-cy=invitedTab]").click();
    cy.get("[data-cy=teamingSearch] input").clear().type(user1.username);
    cy.validateSentInvite({
      username: user1.username,
      role: user1.role,
      email: "",
      status: "Pending",
    });

    cy.logout();

    //Login again as the intivation receipent
    cy.requestLogin(user1.username, user1.password);

    //Go to Settings/Team section & accept the invite
    cy.visit("/settings");
    cy.get("[data-cy=teaming]").click();
    cy.validateProjectsDetails({
      totalProjects: 1,
      ownedProjects: 1,
      invitationsRecieved: 1,
    });
    cy.get("[data-cy=receivedTab]")
      .find("span")
      .eq(0)
      .should("have.text", "1 Invitations");
    cy.get("[data-cy=receivedTab]").click();
    cy.get("[data-cy=receivedInvitationAccept] button").eq(0).click();
    cy.validateProjectsDetails({
      totalProjects: 2,
      ownedProjects: 1,
      invitationsRecieved: 0,
    });
    cy.logout();

    //Login again as Admin to confirm that member has been added.
    cy.requestLogin(AdminName, AdminPassword);

    //Validate the user as a member of project
    cy.visit("/settings");
    cy.get("[data-cy=teaming]").click();
    cy.get("[data-cy=teamingSearch] input").clear().type(user1.username);
    cy.validateMember({
      username: user1.username,
      role: user1.role,
      email: "",
    });

    /// More tests for RBAC operations will be added here
  });

  it("Test case to check the Invitation Functionality (Invitation as a Editor)", () => {
    // Creating a new user for this test case
    cy.getCookie("litmus-cc-token").then((token) => {
      cy.request({
        method: "POST",
        url: Cypress.env("authURL") + "/create",
        body: {
          email: "",
          username: user2.username,
          name: "",
          password: user2.password,
          role: "user",
        },
        headers: {
          authorization: `Bearer ${token.value}`,
        },
      })
        .its("status")
        .should("eq", 200);
    });

    cy.logout();

    // //Login as the intivation receipent
    cy.requestLogin(user2.username, user2.password);
    cy.getStarted(user2.password);
    cy.validateScaffold();
    cy.logout();

    // //Login again as Admin to confirm that member has been added.
    cy.requestLogin(AdminName, AdminPassword);

    //Visit the teaming section and invite the newly created user as viewer"
    cy.visit("/settings");
    cy.get("[data-cy=teaming]").should("be.visible").click();
    cy.get("[data-cy=toolBarComponent]").should("be.visible");
    cy.inviteUser(user2.username, user2.role);

    //Check if invitation got sent in the "Sent Tab"
    cy.get("[data-cy=invitedTab]")
      .find("span")
      .eq(0)
      .should("have.text", "1 Invited");
    cy.get("[data-cy=invitedTab]").click();
    cy.get("[data-cy=teamingSearch] input").clear().type(user2.username);
    cy.validateSentInvite({
      username: user2.username,
      role: user2.role,
      email: "",
      status: "Pending",
    });

    cy.logout();

    //Login again as the intivation receipent
    cy.requestLogin(user2.username, user2.password);

    //Go to Settings/Team section & accept the invite
    cy.visit("/settings");
    cy.get("[data-cy=teaming]").click();
    cy.validateProjectsDetails({
      totalProjects: 1,
      ownedProjects: 1,
      invitationsRecieved: 1,
    });
    cy.get("[data-cy=receivedTab]")
      .find("span")
      .eq(0)
      .should("have.text", "1 Invitations");
    cy.get("[data-cy=receivedTab]").click();
    cy.get("[data-cy=receivedInvitationAccept] button").eq(0).click();
    cy.validateProjectsDetails({
      totalProjects: 2,
      ownedProjects: 1,
      invitationsRecieved: 0,
    });
    cy.logout();

    //Login again as Admin to confirm that member has been added.
    cy.requestLogin(AdminName, AdminPassword);

    //Validate the user as a member of project
    cy.visit("/settings");
    cy.get("[data-cy=teaming]").click();
    cy.get("[data-cy=teamingSearch] input").clear().type(user2.username);
    cy.validateMember({
      username: user2.username,
      role: user2.role,
      email: "",
    });

    /// More tests for RBAC operations will be added here
  });
});
