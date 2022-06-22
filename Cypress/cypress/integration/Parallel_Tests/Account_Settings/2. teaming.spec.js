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
});

describe("Test case to check the Invitation Functionality (Invitation as a Viewer)", () => {
  before("Clearing local storage & login as Admin", () => {
    cy.clearCookie("litmus-cc-token");
    indexedDB.deleteDatabase("localforage");
    cy.requestLogin(AdminName, AdminPassword);
  });

  it("Creating a new user using API & logout", () => {
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
  });

  it("Logging in with newly created user & logout", () => {
    // //Login as the intivation receipent (Project creation required for sending invitation)
    cy.requestLogin(user1.username, user1.password);
    cy.visit("/");
    cy.getStarted(user1.password);
    cy.validateScaffold();
    cy.wait(5000);
    cy.logout();
  });

  it("Logging In as Admin again, invite the user as viewer", () => {
    // //Login again as Admin
    cy.requestLogin(AdminName, AdminPassword);

    //Visit the teaming section and invite the newly created user as viewer"
    cy.visit("/settings");
    cy.get("[data-cy=teaming]").should("be.visible").click();
    cy.get("[data-cy=toolBarComponent]").should("be.visible");
    cy.inviteUser(user1.username, user1.role);
  });

  it("validate the invitation & logout", () => {
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
      shouldExist: true,
    });

    cy.logout();
  });

  it("Logging in as user1, validate the invitation & Accept it", () => {
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

    cy.get("[data-cy=activeTab]")
      .find("span")
      .eq(0)
      .should("have.text", "1 Active");

    cy.get("[data-cy=activeTab]").click();
    cy.get("[data-cy=acceptedInvitationRow]").should("be.visible");
    cy.get("[data-cy=acceptedProjectName]")
      .eq(0)
      .should("have.text", "admin's project");
    cy.get("[data-cy=roleInAcceptedProject]").should(
      "have.text",
      "Role: Viewer"
    );
    cy.get("[data-cy=viewAcceptedProject]").click();
  });

  // Checking scheduling RBAC from UI
  it("Validating scheduling option for Viewer", () => {
    cy.get("[data-cy=workflows]").click();
    cy.get("[data-cy=scheduleWorkflowButton]").click();
    cy.chooseAgent("Self-Agent");
    cy.get("[data-cy=ControlButtons] Button").eq(0).click();
    cy.get("[data-cy=AlertBox]").should("be.visible");
  });

  it("Agent Connection should be disabled", () => {
    cy.get("[data-cy=targets]").click();
    cy.get("[data-cy=connectAgentButton] Button").should("be.disabled");
    cy.contains("td", "Self-Agent").parent().children().eq(7).click();
    // Checking COPY-targetID button to be enabled
    cy.get("[data-cy=agentMenu] li")
      .eq(0)
      .should("not.have.attr", "area-disabled", "false");
    // Checking upgrade button to be disabled
    cy.get("[data-cy=agentMenu] li")
      .eq(1)
      .should("have.attr", "aria-disabled", "true");
    // Checking disconnect button to be disabled
    cy.get("[data-cy=agentMenu] li")
      .eq(2)
      .should("have.attr", "aria-disabled", "true");
    cy.get("body").click(0, 0);
  });

  it("ChaosHub Editing options should not be visible", () => {
    cy.get("[data-cy=myHub]").click();
    cy.get("[data-cy=myHubCardOption]").should("not.exist");
  });

  it("workflow CRUD options should not be visible", () => {
    // Will be added
  });

  it("Again Login as Admin & validate the member", () => {
    //Login again as Admin to confirm that member has been added.
    cy.logout();
    cy.requestLogin(AdminName, AdminPassword);

    //Validate the user as a member of project
    cy.visit("/settings");
    cy.get("[data-cy=teaming]").click();
    cy.get("[data-cy=teamingSearch] input").clear().type(user1.username);
    cy.validateMember({
      username: user1.username,
      role: user1.role,
      email: "",
      shouldExist: true,
    });
  });
});

describe("Test case to check the Invitation Functionality (Invitation as an Editor)", () => {
  before("Clearing local storage & login as Admin", () => {
    cy.clearCookie("litmus-cc-token");
    indexedDB.deleteDatabase("localforage");
    cy.requestLogin(AdminName, AdminPassword);
  });

  it("Creating a new user using API & logout", () => {
    //Creating a new user for this test case
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
  });

  it("Logging in with newly created user & logout", () => {
    // //Login as the intivation receipent (Project creation required for sending invitation)
    cy.requestLogin(user2.username, user2.password);
    cy.visit("/");
    cy.getStarted(user2.password);
    cy.validateScaffold();
    cy.wait(5000);
    cy.logout();
  });

  it("Logging In as Admin again, invite the user as viewer", () => {
    // //Login again as Admin
    cy.requestLogin(AdminName, AdminPassword);
    cy.visit("/");
    //Visit the teaming section and invite the newly created user as viewer"
    cy.visit("/settings");
    cy.get("[data-cy=teaming]").should("be.visible").click();
    cy.get("[data-cy=toolBarComponent]").should("be.visible");
    cy.inviteUser(user2.username, user2.role);
  });

  it("validate the invitation & logout", () => {
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
      shouldExist: true,
    });

    cy.logout();
  });

  it("Logging in as user2, validate the invitation & Accept it", () => {
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
    cy.get("[data-cy=activeTab]")
      .find("span")
      .eq(0)
      .should("have.text", "1 Active");

    cy.get("[data-cy=activeTab]").click();
    cy.get("[data-cy=acceptedInvitationRow]").should("be.visible");
    cy.get("[data-cy=acceptedProjectName]")
      .eq(0)
      .should("have.text", "admin's project");
    cy.get("[data-cy=roleInAcceptedProject]").should(
      "have.text",
      "Role: Editor"
    );
    cy.get("[data-cy=viewAcceptedProject]").click();
  });

  // Checking scheduling RBAC from UI
  it("Validating scheduling option for Editor", () => {
    cy.get("[data-cy=workflows]").click();
    cy.get("[data-cy=scheduleWorkflowButton]").click();
    cy.chooseAgent("Self-Agent");
    cy.get("[data-cy=ControlButtons] Button").eq(0).click();
    cy.get("[data-cy=AlertBox]").should("not.exist");
  });

  it("Agent Connection should be enabled", () => {
    cy.get("[data-cy=targets]").click();
    cy.get("[data-cy=connectAgentButton] Button").should("be.enabled");
    cy.contains("td", "Self-Agent").parent().children().eq(7).click();
    // Checking COPY-targetID button to be enabled
    cy.get("[data-cy=agentMenu] li")
      .eq(0)
      .should("not.have.attr", "area-disabled", "false");
    // Checking disconnect button to be enabled
    cy.get("[data-cy=agentMenu] li")
      .eq(2)
      .should("have.attr", "aria-disabled", "false");
    cy.get("body").click(0, 0);
  });

  it("ChaosHub Editing options should be visible", () => {
    cy.get("[data-cy=myHub]").click();
    cy.get("[data-cy=myHubCardOption]").should("be.visible");
  });

  it("workflow CRUD options should be visible", () => {
    // Will be added
  });

  it("Again Login as Admin & validate the member", () => {
    //Login again as Admin to confirm that member has been added.
    cy.logout();
    cy.requestLogin(AdminName, AdminPassword);

    //Validate the user as a member of project
    cy.visit("/settings");
    cy.get("[data-cy=teaming]").click();
    cy.get("[data-cy=teamingSearch] input").clear().type(user2.username);
    cy.validateMember({
      username: user2.username,
      role: user2.role,
      email: "",
      shouldExist: true,
    });
  });
});

describe("Testing the functionality of removing user from project", () => {
  before("Clearing local storage & login as Admin", () => {
    cy.clearCookie("litmus-cc-token");
    indexedDB.deleteDatabase("localforage");
    cy.requestLogin(AdminName, AdminPassword);
  });

  it("Going to Settings page & removing user1 from admin's project", () => {
    cy.visit("/settings");
    cy.get("[data-cy=teaming]").click();
    cy.get("[data-cy=teamingSearch] input").clear().type(user1.username);
    cy.get("[data-cy=removeMember]").click();
    cy.get("[data-cy=modal]").should("be.visible");
    cy.get("[data-cy=yesButton] button").click();
    cy.validateMember({
      username: user1.username,
      role: user1.role,
      email: "",
      shouldExist: false,
    });
  });

  it("Login again as user1 & check the membership in admin's project", () => {
    cy.visit("/settings");
    cy.get("[data-cy=teaming]").click();
    cy.get("[data-cy=activeTab]")
      .find("span")
      .eq(0)
      .should("have.text", "0 Active");
  });
});

describe("Testing the functionality of leaving from project", () => {
  before("Clearing local storage & login as user2", () => {
    cy.clearCookie("litmus-cc-token");
    indexedDB.deleteDatabase("localforage");
    cy.requestLogin(user2.username, user2.password);
  });

  it("Going to Settings page & leave admin's project", () => {
    cy.visit("/settings");
    cy.get("[data-cy=teaming]").click();
    cy.get("[data-cy=leaveAcceptedProject] Button").click();
    cy.reload(); // Not handled by frontend (Data is updated after refresh)
    cy.get("[data-cy=teaming]").click();
    cy.get("[data-cy=activeTab]")
      .find("span")
      .eq(0)
      .should("have.text", "0 Active");
  });

  it("Login again as admin & check the membership in admin's project", () => {
    cy.logout();
    cy.requestLogin(AdminName, AdminPassword);
    cy.visit("/settings");
    cy.get("[data-cy=teaming]").click();

    // User after leaving the project, should not be member of project
    cy.get("[data-cy=teamingSearch] input").clear().type(user2.username);
    cy.validateMember({
      username: user2.username,
      role: user2.role,
      email: "",
      shouldExist: false,
    });
    // User should be shifted to Invites table with `Exited status`
    cy.get("[data-cy=invitedTab]").click();
    cy.validateSentInvite({
      username: user2.username,
      role: user2.role,
      email: "",
      status: "Exited",
      shouldExist: true,
    });
  });
});

describe("Testing the functionality of resending invitation to exited user2", () => {
  before("Clearing local storage & login as admin", () => {
    cy.clearCookie("litmus-cc-token");
    indexedDB.deleteDatabase("localforage");
    cy.requestLogin(AdminName, AdminPassword);
  });

  it("Goto settings page & resent invitation to user2", () => {
    cy.visit("/settings");
    cy.get("[data-cy=teaming]").click();
    cy.get("[data-cy=invitedTab]").click();
    cy.get("[data-cy=teamingSearch] input").clear().type(user2.username);
    cy.get("[data-cy=resendButton] Button").click();
    cy.get("[data-cy=invitedTab]").click();
    // User should be shifted to Invites table with `Pending status` after resending the invitation
    cy.validateSentInvite({
      username: user2.username,
      role: user2.role,
      email: "",
      status: "Pending",
      shouldExist: true,
    });
  });
});
