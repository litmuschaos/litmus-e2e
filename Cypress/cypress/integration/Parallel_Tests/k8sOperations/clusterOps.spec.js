/// <reference types="Cypress" />

// This is an example test script demostrating how kube-api-server
// can be accessed to get details of cluster resources.

import { apis, KUBE_API_TOKEN } from "../../../kube-apis/apis";

describe("Examples for demonstrating Cluster Operations through REST API", () => {
  it("Test to get workflows in litmus namespace", () => {
    cy.request({
      url: apis.getWorkflows("litmus"),
      method: "GET",
      headers: {
        Authorization: `Bearer ${KUBE_API_TOKEN}`,
      },
    }).should((response) => {
      const workflows = response.body.items;
      // Here, the details are only getting mapped & logged.
      // The fetched data can be used to validate the resources.
      workflows.map((workflow) => {
        cy.log(workflow.metadata.name, workflow.status.phase);
      });
    });
  });

  it("Test to get pods in litmus namespace", () => {
    cy.request({
      url: apis.getPods("litmus"),
      method: "GET",
      headers: {
        Authorization: `Bearer ${KUBE_API_TOKEN}`,
      },
    }).should((response) => {
      const pods = response.body.items;
      pods.map((pod) => {
        cy.log(pod.metadata.name);
      });
    });
  });

  it("Test to get pods by label in litmus namespace", () => {
    cy.request({
      url: apis.getPodByLabel("litmus", "component=litmusportal-frontend"),
      method: "GET",
      headers: {
        Authorization: `Bearer ${KUBE_API_TOKEN}`,
      },
    }).should((response) => {
      const pods = response.body.items;
      pods.map((pod) => {
        cy.log(pod.metadata.name);
      });
    });
  });
});
