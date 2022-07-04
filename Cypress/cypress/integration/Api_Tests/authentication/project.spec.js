/// <reference types="Cypress" />

import * as user from "../../../fixtures/Users.json";
import * as myhubInput from "../../../fixtures/myhubInput.json";
import endpoints from "../../../fixtures/endpoints";
import {
  unauthorized,
  permission_denied,
  invalid_role,
  invalid_request,
} from "../../../fixtures/errorCodes";
import { ADD_MY_HUB } from "../../../fixtures/graphql/mutations";

const Project1Name = "Project1",
  Project2Name = "Project2",
  updatedProject2Name1 = "Project_2a",
  updatedProject2Name2 = "Project_2b";
let user1Id,
  user2Id,
  user3Id,
  adminAccessToken,
  user1AccessToken,
  user2AccessToken,
  user3AccessToken,
  Project1Id,
  Project2Id;

before("create 3 test users", () => {
  cy.task("clearDB")
    .then(() => {
      cy.clearCookie("litmus-cc-token");
      indexedDB.deleteDatabase("localforage");
    })
    .then(() => {
      return cy.getAccessToken(user.AdminName, user.AdminPassword);
    })
    .then((token) => {
      adminAccessToken = token;
      return cy.createProject("admin's project", adminAccessToken);
    })
    .then(() => {
      let usersData = [user.user1, user.user2, user.user3];
      return cy.createTestUsers(usersData, adminAccessToken);
    })
    .then((res) => {
      user1Id = res[0];
      user2Id = res[1];
      user3Id = res[2];
      return cy.getAccessToken(user.AdminName, user.AdminPassword);
    })
    .then((res) => {
      adminAccessToken = res;
      return cy.getAccessToken(user.user1.username, user.user1.password);
    })
    .then((res) => {
      user1AccessToken = res;
      return cy.getAccessToken(user.user2.username, user.user2.password);
    })
    .then((res) => {
      user2AccessToken = res;
      return cy.getAccessToken(user.user3.username, user.user3.password);
    })
    .then((res) => {
      user3AccessToken = res;
    });
});

/*
  Project1: admin (Owner), user3 (Editor)
  Project2: user1(Owner), user2(Editor), user3(Viewer)
*/
describe("Testing post request to createProject api", () => {
  it("Testing api without access_token [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.createProject(),
      body: {
        project_name: user.AdminName,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api without project name [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.createProject(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        project_name: "",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
    });
  });

  it("Testing api from admin account", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.createProject(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        project_name: Project1Name,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("data");
      ["ID", "Name", "Members", "State", "CreatedAt", "UpdatedAt"].forEach(
        (property) => {
          expect(res.body.data).to.have.property(property);
        }
      );
      expect(res.body.data.Members).to.be.an("array");
      expect(res.body.data.Members.length).to.eq(1);
      Project1Id = res.body.data.ID;
    });
  });

  it("Testing api from non-admin account", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.createProject(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        project_name: Project2Name,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("data");
      ["ID", "Name", "Members", "State", "CreatedAt", "UpdatedAt"].forEach(
        (property) => {
          expect(res.body.data).to.have.property(property);
        }
      );
      expect(res.body.data.Members).to.be.an("array");
      expect(res.body.data.Members.length).to.eq(1);
      Project2Id = res.body.data.ID;
    });
  });
});

describe("Testing get request to listProjects api", () => {
  it("Testing api without access_token [ Should not be possible ]", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.listProjects(),
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api from admin account", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.listProjects(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("data");
      res.body.data.forEach((project) => {
        ["ID", "Name", "Members", "State", "CreatedAt", "UpdatedAt"].forEach(
          (property) => {
            expect(project).to.have.property(property);
          }
        );
        expect(project.Members).to.be.an("array");
      });
    });
  });

  it("Testing api from non-admin account", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.listProjects(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("data");
      res.body.data.forEach((project) => {
        ["ID", "Name", "Members", "State", "CreatedAt", "UpdatedAt"].forEach(
          (property) => {
            expect(project).to.have.property(property);
          }
        );
        expect(project.Members).to.be.an("array");
        expect(project.Members.length).to.eq(1);
      });
    });
  });
});

describe("Testing get request to getProjectById api", () => {
  it("Testing api without access_token [ Should not be possible ]", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.getProjectById(Project1Id),
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api from admin account with valid project id", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.getProjectById(Project1Id),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("data");
      ["ID", "Name", "Members", "State", "CreatedAt", "UpdatedAt"].forEach(
        (property) => {
          expect(res.body.data).to.have.property(property);
        }
      );
      expect(res.body.data.Members).to.be.an("array");
      expect(res.body.data.Members.length).to.eq(1);
    });
  });

  it("Testing api from admin account with Project2Id", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.getProjectById(Project2Id),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api from non-admin account with valid project id", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.getProjectById(Project2Id),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("data");
      ["ID", "Name", "Members", "State", "CreatedAt", "UpdatedAt"].forEach(
        (property) => {
          expect(res.body.data).to.have.property(property);
        }
      );
      expect(res.body.data.Members).to.be.an("array");
      expect(res.body.data.Members.length).to.eq(1);
    });
  });

  it("Testing api from non-admin account with no project access [ Should not be possible ]", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.getProjectById(Project1Id),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });
});

describe("Testing post request to sendInvitation api", () => {
  it("Testing api without access_token [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.sendInvitation(),
      body: {
        project_id: Project1Id,
        user_id: user1Id,
        role: "Viewer",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api without project_id [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.sendInvitation(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        user_id: user1Id,
        role: "Viewer",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api without user_id [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.sendInvitation(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        project_id: Project1Id,
        role: "Viewer",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
    });
  });

  it("Testing api without role [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.sendInvitation(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        project_id: Project1Id,
        user_id: user1Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(invalid_role);
    });
  });

  it("Sending invitation of project2 to user2 [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.sendInvitation(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        project_id: Project2Id,
        user_id: user2Id,
        role: "Viewer",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Sending invitation of project1 to user2", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.sendInvitation(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        project_id: Project1Id,
        user_id: user2Id,
        role: "Viewer",
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("data");
    });
  });

  it("Sending invitation of project1 to user3", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.sendInvitation(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        project_id: Project1Id,
        user_id: user3Id,
        role: "Editor",
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("data");
    });
  });

  it("Sending invitation of project2 to user2", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.sendInvitation(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        project_id: Project2Id,
        user_id: user2Id,
        role: "Editor",
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("data");
    });
  });

  it("Sending invitation of project2 to user3", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.sendInvitation(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        project_id: Project2Id,
        user_id: user3Id,
        role: "Viewer",
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("data");
    });
  });
});

describe("Testing post request to declineInvitation api", () => {
  it("Testing api without access_token [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.declineInvitation(),
      body: {
        project_id: Project1Id,
        user_id: user1Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api without project_id [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.declineInvitation(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        user_id: user1Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api without user_id [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.declineInvitation(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        project_id: Project1Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
    });
  });

  it("Decline invitation which was never sent [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.declineInvitation(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        project_id: Project1Id,
        user_id: user1Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
    });
  });

  it("Decline invitation of project1 by user2", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.declineInvitation(),
      headers: {
        authorization: `Bearer ${user2AccessToken}`,
      },
      body: {
        project_id: Project1Id,
        user_id: user2Id,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("message");
      expect(res.body.message).to.eq("Successful");
    });
  });
});

describe("Testing post request to acceptInvitation api", () => {
  it("Testing api without access_token [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.acceptInvitation(),
      body: {
        project_id: Project1Id,
        user_id: user1Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api without project_id [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.acceptInvitation(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        user_id: user1Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api without user_id [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.acceptInvitation(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        project_id: Project1Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
    });
  });

  it("Accept invitation which was never sent [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.acceptInvitation(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        project_id: Project1Id,
        user_id: user1Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
    });
  });

  it("Accept invitation of project1 by user3", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.acceptInvitation(),
      headers: {
        authorization: `Bearer ${user3AccessToken}`,
      },
      body: {
        project_id: Project1Id,
        user_id: user3Id,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("message");
      expect(res.body.message).to.eq("Successful");
    });
  });

  it("Accept invitation of project2 by user2", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.acceptInvitation(),
      headers: {
        authorization: `Bearer ${user2AccessToken}`,
      },
      body: {
        project_id: Project2Id,
        user_id: user2Id,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("message");
      expect(res.body.message).to.eq("Successful");
    });
  });

  it("Accept invitation of project2 by user3", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.acceptInvitation(),
      headers: {
        authorization: `Bearer ${user3AccessToken}`,
      },
      body: {
        project_id: Project2Id,
        user_id: user3Id,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("message");
      expect(res.body.message).to.eq("Successful");
    });
  });
});

describe("Testing get request to getUserWithProject api", () => {
  it("Testing api without access_token [ Should not be possible ]", () => {
    cy.request({
      method: "GET",
      url:
        Cypress.env("authURL") +
        endpoints.getUserWithProject(user.user3.username),
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api with invalid username [ Should not be possible ]", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.getUserWithProject("abc"),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api by non-admin user [ Should not be possible ]", () => {
    cy.request({
      method: "GET",
      url:
        Cypress.env("authURL") +
        endpoints.getUserWithProject(user.user3.username),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
    });
  });

  it("Testing api to get self project information", () => {
    cy.request({
      method: "GET",
      url:
        Cypress.env("authURL") +
        endpoints.getUserWithProject(user.user1.username),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("data");
      ["CreatedAt", "Email", "ID", "Name", "Projects", "Username"].forEach(
        (property) => {
          expect(res.body.data).to.have.property(property);
        }
      );
      expect(res.body.data.Projects).to.be.an("array");
      res.body.data.Projects.forEach((project) => {
        ["ID", "CreatedAt", "Members", "Name", "State", "UpdatedAt"].forEach(
          (projectProperty) => {
            expect(project).to.have.property(projectProperty);
          }
        );
        expect(project.Members).to.be.an("array");
        project.Members.forEach((member) => {
          ["Invitation", "JoinedAt", "Role", "UserID"].forEach(
            (memberProperty) => {
              expect(member).to.have.property(memberProperty);
            }
          );
        });
      });
    });
  });

  it("Testing api by admin user", () => {
    cy.request({
      method: "GET",
      url:
        Cypress.env("authURL") + endpoints.getUserWithProject(user.AdminName),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("data");
      ["CreatedAt", "Email", "ID", "Name", "Projects", "Username"].forEach(
        (property) => {
          expect(res.body.data).to.have.property(property);
        }
      );
      expect(res.body.data.Projects).to.be.an("array");
      res.body.data.Projects.forEach((project) => {
        ["ID", "CreatedAt", "Members", "Name", "State", "UpdatedAt"].forEach(
          (projectProperty) => {
            expect(project).to.have.property(projectProperty);
          }
        );
        expect(project.Members).to.be.an("array");
        project.Members.forEach((member) => {
          ["Invitation", "JoinedAt", "Role", "UserID"].forEach(
            (memberProperty) => {
              expect(member).to.have.property(memberProperty);
            }
          );
        });
      });
    });
  });
});

describe("Testing post request to updateProjectName api", () => {
  it("Testing api without access_token [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updateProjectName(),
      body: {
        project_id: Project1Id,
        project_name: "Project_1",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api without project_id [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updateProjectName(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        project_name: "Project_1",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api without project_name [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updateProjectName(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        project_id: Project1Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Changing project name by a user with no access to that project [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updateProjectName(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        project_id: Project1Id,
        project_name: "Project_1",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Changing project name by a user with viewer access to that project [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updateProjectName(),
      headers: {
        authorization: `Bearer ${user3AccessToken}`,
      },
      body: {
        project_id: Project2Id,
        project_name: "Project_2",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Changing name by a user with editor access to project", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updateProjectName(),
      headers: {
        authorization: `Bearer ${user3AccessToken}`,
      },
      body: {
        project_id: Project2Id,
        project_name: "Project_2",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Changing name admin with no access to project", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updateProjectName(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        project_id: Project2Id,
        project_name: updatedProject2Name1,
      },
    })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.eq("Successful");
        return cy.request({
          method: "GET",
          url: Cypress.env("authURL") + endpoints.getProjectById(Project2Id),
          headers: {
            authorization: `Bearer ${user1AccessToken}`,
          },
        });
      })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("data");
        expect(res.body.data.Name).to.eq(updatedProject2Name1);
      });
  });

  it("Changing name by a user with owner access to project", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updateProjectName(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        project_id: Project2Id,
        project_name: updatedProject2Name2,
      },
    })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.eq("Successful");
        return cy.request({
          method: "GET",
          url: Cypress.env("authURL") + endpoints.getProjectById(Project2Id),
          headers: {
            authorization: `Bearer ${user1AccessToken}`,
          },
        });
      })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("data");
        expect(res.body.data.Name).to.eq(updatedProject2Name2);
      });
  });
});

describe("Testing post request to removeInvitation api", () => {
  it("Testing api without access_token [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.removeInvitation(),
      body: {
        project_id: Project2Id,
        user_id: user2Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api without project_id [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.removeInvitation(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        user_id: user2Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api without user_id [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.removeInvitation(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        project_id: Project2Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(invalid_request);
    });
  });

  it("Remove invitation by a user with no access to that project [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.removeInvitation(),
      headers: {
        authorization: `Bearer ${user2AccessToken}`,
      },
      body: {
        project_id: Project1Id,
        user_id: user3Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Remove invitation by a user with viewer access to that project [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.removeInvitation(),
      headers: {
        authorization: `Bearer ${user3AccessToken}`,
      },
      body: {
        project_id: Project2Id,
        user_id: user2Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Remove invitation by project owner", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.removeInvitation(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        project_id: Project2Id,
        user_id: user3Id,
      },
    })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.eq("Successful");
        return cy.request({
          method: "GET",
          url: Cypress.env("authURL") + endpoints.listProjects(),
          headers: {
            authorization: `Bearer ${user3AccessToken}`,
          },
        });
      })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("data");
        res.body.data.forEach((project) => {
          expect(project.ID).to.not.eq(Project2Id);
        });
      });
  });
});

describe("Testing post request to leaveProject api", () => {
  it("Testing api without access_token [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.leaveProject(),
      body: {
        project_id: Project2Id,
        user_id: user2Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api without project_id [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.leaveProject(),
      headers: {
        authorization: `Bearer ${user2AccessToken}`,
      },
      body: {
        user_id: user2Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api without user_id [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.leaveProject(),
      headers: {
        authorization: `Bearer ${user2AccessToken}`,
      },
      body: {
        project_id: Project2Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Test leaving a project which the user was not a part of [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.leaveProject(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        project_id: Project1Id,
        user_id: user1Id,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Test leaving project", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.leaveProject(),
      headers: {
        authorization: `Bearer ${user2AccessToken}`,
      },
      body: {
        project_id: Project2Id,
        user_id: user2Id,
      },
    })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.eq("Successful");
        return cy.request({
          method: "GET",
          url: Cypress.env("authURL") + endpoints.listProjects(),
          headers: {
            authorization: `Bearer ${user2AccessToken}`,
          },
        });
      })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.eq("No projects found");
        return cy.request({
          method: "POST",
          url: Cypress.env("apiURL") + endpoints.query(),
          body: {
            operationName: "addChaosHub",
            variables: {
              request: {
                ...myhubInput.default,
                projectID: Project2Id,
              },
            },
            query: ADD_MY_HUB,
          },
          headers: {
            authorization: user2AccessToken,
          },
          failOnStatusCode: false,
        });
      })
      .then((res) => {
        cy.validateErrorMessage(res, permission_denied);
      });
  });
});
