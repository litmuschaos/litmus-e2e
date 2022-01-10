/// <reference types="Cypress" />
//This Script provides plugins and common utilities for tests.

//// ******************* Plugins Added *****************************
import "@4tw/cypress-drag-drop";
import "cypress-file-upload";
import "cypress-wait-until";
import { apis, KUBE_API_TOKEN } from "../kube-apis/apis";
import * as user from "../fixtures/Users.json";

//Custom Command for waiting for required Agent to come in active state.
Cypress.Commands.add("waitForCluster", (agentName) => {
  cy.visit("/targets");
  // Checking if required Agent is there.
  // cy.get("table").contains("td", agentName).should("be.visible");
  // Wait for Agent to be active
  cy.waitUntil(
    () =>
      cy
        .contains("td", agentName)
        .parent()
        .children()
        .eq(0)
        .then(($div) => {
          return $div.text() == "Active" ? true : false;
        }),
    {
      verbose: true,
      interval: 500,
      timeout: 60000,
    }
  );
});

// GraphQL Waiting
Cypress.Commands.add("GraphqlWait", (operationName, alias) => {
  cy.intercept("POST", Cypress.env("apiURL") + "/query", (req) => {
    if (req.body.operationName.includes(operationName)) {
      req.alias = alias;
    }
  });
});

//Custom command for Logut.
Cypress.Commands.add("logout", () => {
  cy.clearCookie("litmus-cc-token");
  cy.reload();
});

//Custom command for closing modal.
Cypress.Commands.add("modalClose", () => {
  cy.get("[data-cy=done]").should("be.visible");
  cy.get("[data-cy=done]").click();
});

// Create target application
Cypress.Commands.add(
  "createTargetApplication",
  (namespace, targetAppName, label) => {
    const configData = {
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: {
        name: targetAppName,
        labels: {
          app: label,
          name: label,
        },
      },
      spec: {
        replicas: 1,
        revisionHistoryLimit: 10,
        selector: {
          matchLabels: {
            app: label,
            name: label,
          },
        },
        template: {
          metadata: {
            labels: {
              app: label,
              name: label,
            },
          },
          spec: {
            containers: [
              {
                name: "nginx",
                image: "nginx:1.14",
                ports: [
                  {
                    containerPort: 80,
                  },
                ],
              },
            ],
          },
        },
      },
    };
    cy.request({
      url: apis.createDeployment(namespace),
      method: "POST",
      headers: {
        Authorization: `Bearer ${KUBE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: configData,
    }).should((response) => {
      console.log(response);
    });
  }
);

// Delete target application
Cypress.Commands.add("deleteTargetApplication", (namespace, targetAppName) => {
  const configData = {
    gracePeriodSeconds: 0,
    orphanDependents: false,
  };
  cy.request({
    url: apis.deleteDeployment(namespace, targetAppName),
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${KUBE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: configData,
  }).should((response) => {
    console.log(response);
  });
});

Cypress.Commands.add("validateScaffold", () => {
  cy.get("[data-cy=headerComponent]").should("be.visible");
  cy.get("[data-cy=sidebarComponent]").should("be.visible");
});

Cypress.Commands.add("validateErrorMessage", (res, message) => {
  expect(res.body).to.have.nested.property("errors[0].message");
  expect(res.body.errors[0].message).to.eq(message);
});

/*
  Project1: Admin(Owner), user1(Editor), user3(Viewer)
  Project2: Admin(Owner), user2(Viewer)
*/
Cypress.Commands.add("securityCheckSetup", () => {
  const Projects = {
    project1: "project1",
    project2: "project2",
  };
  let project1Id, project2Id, user1Id, user2Id, user3Id, accessToken;
  cy.requestLogin(user.AdminName, user.AdminPassword);
  return cy.getCookie("litmus-cc-token")
    .then((token) => {
      accessToken=token.value;
      // create user1
      const createUser1 = cy.request({
        method: "POST",
        url: Cypress.env("authURL") + "/create",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: { ...(user.user1) }
      }).then((res) => {
        user1Id = res.body._id;
      });

      // create user2
      const createUser2 = cy.request({
        method: "POST",
        url: Cypress.env("authURL") + "/create",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: { ...(user.user2) }
      }).then((res) => {
          user2Id = res.body._id;
        });
      
      // create user3
      const createUser3 = cy.request({
        method: "POST",
        url: Cypress.env("authURL") + "/create",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: { ...(user.user3) }
      }).then((res) => {
          user3Id = res.body._id;
        });
      
      // create project1
      const createProject1 = cy.request({
        method: "POST",
        url: Cypress.env("authURL") + "/create_project",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: { 
          project_name: Projects.project1
        }
      }).then((res) => {
          project1Id = res.body.data.ID;
        });
      // create project2
      const createProject2 = cy.request({
        method: "POST",
        url: Cypress.env("authURL") + "/create_project",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: { 
          project_name: Projects.project2
        }
      }).then((res) => {
          project2Id = res.body.data.ID;
        });
      return Promise.all([createUser1, createUser2, createUser3, createProject1, createProject2]);
    })
    .then(() => {
      // send invitation of project1 to user1 with Editor role
      return cy.request({
        method: "POST",
        url: Cypress.env("authURL") + "/send_invitation",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          project_id: project1Id,
          user_id: user1Id,
          role: "Editor"
        }
      })
    })
    .then(() => {
      // send invitation of project1 to user3 with Viewer role
      return cy.request({
        method: "POST",
        url: Cypress.env("authURL") + "/send_invitation",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          project_id: project1Id,
          user_id: user3Id,
          role: "Viewer"
        }
      })
    })
    .then(() => {
      // send invitation of project2 to user2 with Viewer role
      return cy.request({
        method: "POST",
        url: Cypress.env("authURL") + "/send_invitation",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          project_id: project2Id,
          user_id: user2Id,
          role: "Viewer"
        }
      }) 
    })
    .then(() => {
      cy.logout();
      cy.requestLogin(user.user3.username, user.user3.password);
      return cy.getCookie("litmus-cc-token");
    })
    .then((token) => {
      return cy.request({
        method: "POST",
        url: Cypress.env("authURL") + "/accept_invitation",
        headers: {
          authorization: `Bearer ${token.value}`,
        },
        body: {
          "project_id": project1Id,
          "user_id": user3Id
        }
      })
    })
    .then(() => {
      cy.logout();
      cy.requestLogin(user.user1.username, user.user1.password);
      return cy.getCookie("litmus-cc-token");
    })
    .then((token) => {
      return cy.request({
        method: "POST",
        url: Cypress.env("authURL") + "/accept_invitation",
        headers: {
          authorization: `Bearer ${token.value}`,
        },
        body: {
          "project_id": project1Id,
          "user_id": user1Id
        }
      })
    })
    .then(() => {
      cy.logout();
      cy.requestLogin(user.user2.username, user.user2.password);
      return cy.getCookie("litmus-cc-token");
    })
    .then((token) => {
      return cy.request({
        method: "POST",
        url: Cypress.env("authURL") + "/accept_invitation",
        headers: {
          authorization: `Bearer ${token.value}`,
        },
        body: {
          "project_id": project2Id,
          "user_id": user2Id
        }
      })
    })
    .then(() => {
      return {project1Id, project2Id, user1Id, user2Id, user3Id};
    });
});
