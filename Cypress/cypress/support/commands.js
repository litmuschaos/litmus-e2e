/* eslint-disable cypress/no-assigning-return-values */
/// <reference types="Cypress" />
//This Script provides plugins and common utilities for tests.

//// ******************* Plugins Added *****************************
import "@4tw/cypress-drag-drop";
import "cypress-file-upload";
import "cypress-wait-until";
import { apis, KUBE_API_TOKEN } from "../kube-apis/apis";
import * as user from "../fixtures/Users.json";
import endpoints from "../fixtures/endpoints";

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
  cy.intercept("POST", Cypress.env("apiURL") + endpoints.query(), (req) => {
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
  expect(res.status).to.eq(200);
  expect(res.body).to.have.nested.property("errors[0].message");
  expect(res.body.errors[0].message).to.eq(message);
});

/*
  Project1: Admin(Owner), user1(Editor), user3(Viewer)
  Project2: user1(Owner), user2(Viewer)
*/
Cypress.Commands.add("createTestUsers", (usersData) => {
  let adminAccessToken;
  let arr = [];
  cy.requestLogin(user.AdminName, user.AdminPassword);
  return cy.getCookie("litmus-cc-token").then((token) => {
    adminAccessToken = token.value;
    cy.wrap(usersData)
      .each((userData) => {
        return cy
          .request({
            method: "POST",
            url: Cypress.env("authURL") + endpoints.createUser(),
            headers: {
              authorization: `Bearer ${adminAccessToken}`,
            },
            body: userData,
          })
          .then((res) => {
            arr.push(res.body._id);
          });
      })
      .then(() => {
        return arr;
      });
  });
});

Cypress.Commands.add(
  "createTestProjects",
  (adminProjectId, user1Id, user2Id, user3Id) => {
    const Projects = {
      project2: "user1's project",
    };
    let project1Id = adminProjectId,
      project2Id,
      adminAccessToken,
      user1AccessToken;
    cy.logout();
    cy.requestLogin(user.AdminName, user.AdminPassword);
    return cy
      .getCookie("litmus-cc-token")
      .then((token) => {
        adminAccessToken = token.value;
        // send invitation of project1 to user1 with Editor role
        return cy.request({
          method: "POST",
          url: Cypress.env("authURL") + endpoints.sendInvitation(),
          headers: {
            authorization: `Bearer ${adminAccessToken}`,
          },
          body: {
            project_id: project1Id,
            user_id: user1Id,
            role: "Editor",
          },
        });
      })
      .then(() => {
        // send invitation of project1 to user3 with Viewer role
        return cy.request({
          method: "POST",
          url: Cypress.env("authURL") + endpoints.sendInvitation(),
          headers: {
            authorization: `Bearer ${adminAccessToken}`,
          },
          body: {
            project_id: project1Id,
            user_id: user3Id,
            role: "Viewer",
          },
        });
      })
      .then(() => {
        cy.requestLogin(user.user1.username, user.user1.password);
        return cy.getCookie("litmus-cc-token");
      })
      .then((token) => {
        user1AccessToken = token.value;
        // create project2
        return cy
          .request({
            method: "POST",
            url: Cypress.env("authURL") + endpoints.createProject(),
            headers: {
              authorization: `Bearer ${user1AccessToken}`,
            },
            body: {
              project_name: Projects.project2,
            },
          })
          .then((res) => {
            project2Id = res.body.data.ID;
          });
      })
      .then(() => {
        // send invitation of project2 to user2 with Viewer role
        return cy.request({
          method: "POST",
          url: Cypress.env("authURL") + endpoints.sendInvitation(),
          headers: {
            authorization: `Bearer ${user1AccessToken}`,
          },
          body: {
            project_id: project2Id,
            user_id: user2Id,
            role: "Viewer",
          },
        });
      })
      .then(() => {
        cy.logout();
        cy.requestLogin(user.user3.username, user.user3.password);
        return cy.getCookie("litmus-cc-token");
      })
      .then((token) => {
        return cy.request({
          method: "POST",
          url: Cypress.env("authURL") + endpoints.acceptInvitation(),
          headers: {
            authorization: `Bearer ${token.value}`,
          },
          body: {
            project_id: project1Id,
            user_id: user3Id,
          },
        });
      })
      .then(() => {
        cy.logout();
        cy.requestLogin(user.user1.username, user.user1.password);
        return cy.getCookie("litmus-cc-token");
      })
      .then((token) => {
        return cy.request({
          method: "POST",
          url: Cypress.env("authURL") + endpoints.acceptInvitation(),
          headers: {
            authorization: `Bearer ${token.value}`,
          },
          body: {
            project_id: project1Id,
            user_id: user1Id,
          },
        });
      })
      .then(() => {
        cy.logout();
        cy.requestLogin(user.user2.username, user.user2.password);
        return cy.getCookie("litmus-cc-token");
      })
      .then((token) => {
        return cy.request({
          method: "POST",
          url: Cypress.env("authURL") + endpoints.acceptInvitation(),
          headers: {
            authorization: `Bearer ${token.value}`,
          },
          body: {
            project_id: project2Id,
            user_id: user2Id,
          },
        });
      })
      .then(() => {
        return cy.logout();
      })
      .then(() => {
        return { project1Id, project2Id, user1Id, user2Id, user3Id };
      });
  }
);

Cypress.Commands.add("createProject", (projectName) => {
  let projectId;
  return cy
    .getCookie("litmus-cc-token")
    .then((token) => {
      return cy
        .request({
          method: "POST",
          url: Cypress.env("authURL") + endpoints.createProject(),
          headers: {
            authorization: `Bearer ${token.value}`,
          },
          body: {
            project_name: projectName,
          },
        })
        .then((res) => {
          projectId = res.body.data.ID;
        });
    })
    .then(() => {
      return projectId;
    });
});

Cypress.Commands.add(
  "createNamespaceAgent",
  (agentName, projectId, namespace = "n1") => {
    return cy
      .exec(
        "kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/manifests/litmus-portal-crds.yml",
        { timeout: 60000 }
      )
      .then(() => {
        const url = Cypress.config().baseUrl;
        return cy.exec(
          `litmusctl config set-account  --endpoint '${url}' --password 'litmus' --username 'admin'`,
          { timeout: 60000 }
        );
      })
      .then(() => {
        return cy.exec(
          `kubectl get ns | awk '/${namespace}/' | awk '{print $1}'`,
          { timeout: 60000 }
        );
      })
      .then((res) => {
        if (res.stdout === "") {
          return cy.exec(`kubectl create ns ${namespace}`, {
            timeout: 60000,
          });
        } else {
          return cy.exec(
            `kubectl delete ns ${namespace} && kubectl create ns ${namespace}`,
            { timeout: 60000 }
          );
        }
      })
      .then(() => {
        return cy.exec(
          `litmusctl connect agent --agent-name='${agentName}' --project-id='${projectId}' --namespace='${namespace}'  --installation-mode='namespace' --non-interactive`,
          { timeout: 600000 }
        );
      })
      .then(() => {
        return cy.task("waitForAgent", agentName, { timeout: 600000 });
      });
  }
);

Cypress.Commands.add("getAccessToken", (username, password) => {
  return cy
    .request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.login(),
      body: {
        username,
        password,
      },
    })
    .then((res) => {
      return res.body.access_token;
    });
});
