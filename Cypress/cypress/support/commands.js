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
import { GET_CLUSTER } from "../fixtures/graphql/queries";
import { REGISTER_CLUSTER } from "../fixtures/graphql/mutations";

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

Cypress.Commands.add("createTestUsers", (usersData, adminAccessToken) => {
  let arr = [];
  return cy
    .wrap(usersData)
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

Cypress.Commands.add(
  "sendInvitation",
  (accessToken, projectId, userId, role) => {
    return cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.sendInvitation(),
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      body: {
        project_id: projectId,
        user_id: userId,
        role: role,
      },
    });
  }
);

Cypress.Commands.add("acceptInvitation", (accessToken, projectId, userId) => {
  return cy.request({
    method: "POST",
    url: Cypress.env("authURL") + endpoints.acceptInvitation(),
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    body: {
      project_id: projectId,
      user_id: userId,
    },
  });
});

/*
  Project1: Admin(Owner), user1(Editor), user3(Viewer)
  Project2: user1(Owner), user2(Viewer)
*/
Cypress.Commands.add(
  "createTestProjects",
  (adminProjectId, adminAccessToken, userRecords) => {
    let projectIds = [];
    return cy
      .wrap(userRecords)
      .each((userRecord, index) => {
        return cy
          .request({
            method: "POST",
            url: Cypress.env("authURL") + endpoints.createProject(),
            headers: {
              authorization: `Bearer ${userRecord.accessToken}`,
            },
            body: {
              project_name: `user${index + 1}'s project`,
            },
          })
          .then((res) => {
            projectIds.push(res.body.data.ID);
          });
      })
      .then(() => {
        return cy.sendInvitation(
          adminAccessToken,
          adminProjectId,
          userRecords[0].userId,
          "Editor"
        );
      })
      .then(() => {
        return cy.sendInvitation(
          adminAccessToken,
          adminProjectId,
          userRecords[2].userId,
          "Viewer"
        );
      })
      .then(() => {
        return cy.sendInvitation(
          userRecords[0].accessToken,
          projectIds[0],
          userRecords[1].userId,
          "Viewer"
        );
      })
      .then(() => {
        return cy.acceptInvitation(
          userRecords[2].accessToken,
          adminProjectId,
          userRecords[2].userId,
          "Viewer"
        );
      })
      .then(() => {
        return cy.acceptInvitation(
          userRecords[0].accessToken,
          adminProjectId,
          userRecords[0].userId
        );
      })
      .then(() => {
        return cy.acceptInvitation(
          userRecords[1].accessToken,
          projectIds[0],
          userRecords[1].userId
        );
      })
      .then(() => {
        return projectIds;
      });
  }
);

Cypress.Commands.add("createProject", (projectName, accessToken) => {
  return cy
    .request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.createProject(),
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      body: {
        project_name: projectName,
      },
    })
    .then((res) => {
      return res.body.data.ID;
    });
});

Cypress.Commands.add(
  "createNamespaceAgent",
  (agentName, projectId, adminAccessToken, namespace = "n1") => {
    const url = Cypress.config().baseUrl;
    let clusterID;
    return cy
      .exec(
        "kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/manifests/litmus-portal-crds.yml",
        { timeout: 60000 }
      )
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
        cy.request(
          {
            method: "POST",
            url: Cypress.env("apiURL") + endpoints.query(),
            body: {
              operationName: "registerCluster",
              variables: {
                request: {
                  clusterName: agentName,
                  platformName: "local",
                  projectID: projectId,
                  clusterType: "external",
                  agentScope: "namespace",
                  agentNamespace: namespace,
                  tolerations: [],
                },
              },
              query: REGISTER_CLUSTER,
            },
            headers: {
              authorization: adminAccessToken,
            },
          },
          { timeout: 600000 }
        );
      })
      .then((res) => {
        clusterID = res.body.data.registerCluster.clusterID;
        return cy.exec(
          `kubectl apply -f ${url}api/file/${res.body.data.registerCluster.token}.yaml`,
          { timeout: 60000 }
        );
      })
      .then(() => {
        return cy.task("waitForAgent", agentName, { timeout: 600000 });
      })
      .then(() => {
        return clusterID;
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

Cypress.Commands.add("getAccessTokens", (usersData) => {
  let accessTokens = [];
  return cy
    .wrap(usersData)
    .each((userData) => {
      return cy
        .request({
          method: "POST",
          url: Cypress.env("authURL") + endpoints.login(),
          body: {
            username: userData.username,
            password: userData.password,
          },
        })
        .then((res) => {
          accessTokens.push(res.body.access_token);
          return res.body.access_token;
        });
    })
    .then(() => {
      return accessTokens;
    });
});

function getNested(obj, ...args) {
  return args.reduce((obj, level) => obj && obj[level], obj);
}

Cypress.Commands.add("initialRBACSetup", (createAgent) => {
  const usersData = [user.user1, user.user2, user.user3];
  let adminProjectId,
    project1Id,
    project2Id,
    project3Id,
    adminAccessToken,
    user1AccessToken,
    user2AccessToken,
    user3AccessToken,
    user1Id,
    user2Id,
    user3Id,
    cluster1Id;

  return cy
    .task("clearDB")
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
    .then((projectId) => {
      adminProjectId = projectId;
      if (createAgent) {
        return cy.createNamespaceAgent("a1", adminProjectId, adminAccessToken);
      } else {
        return null;
      }
    })
    .then(() => {
      return cy.createTestUsers(usersData, adminAccessToken);
    })
    .then((res) => {
      user1Id = res[0];
      user2Id = res[1];
      user3Id = res[2];
      return cy.getAccessTokens(usersData);
    })
    .then((res) => {
      user1AccessToken = res[0];
      user2AccessToken = res[1];
      user3AccessToken = res[2];
      let userRecords = [
        {
          userId: user1Id,
          accessToken: user1AccessToken,
        },
        {
          userId: user2Id,
          accessToken: user2AccessToken,
        },
        {
          userId: user3Id,
          accessToken: user3AccessToken,
        },
      ];
      return cy.createTestProjects(
        adminProjectId,
        adminAccessToken,
        userRecords
      );
    })
    .then((projectIds) => {
      project1Id = projectIds[0];
      project2Id = projectIds[1];
      project3Id = projectIds[1];
      return cy.request({
        method: "POST",
        url: Cypress.env("apiURL") + endpoints.query(),
        body: {
          operationName: "listClusters",
          variables: {
            projectID: project1Id,
          },
          query: GET_CLUSTER,
        },
        headers: {
          authorization: adminAccessToken,
        },
      });
    })
    .then((res) => {
      cluster1Id = getNested(
        res,
        "body",
        "data",
        "listClusters",
        "at(0)",
        "clusterID"
      );
      return {
        adminProjectId,
        project1Id,
        project2Id,
        project3Id,
        adminAccessToken,
        user1AccessToken,
        user2AccessToken,
        user3AccessToken,
        user1Id,
        user2Id,
        user3Id,
        cluster1Id,
      };
    });
});
