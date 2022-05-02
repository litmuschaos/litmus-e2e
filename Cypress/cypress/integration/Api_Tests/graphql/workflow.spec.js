/// <reference types="Cypress" />

import * as user from "../../../fixtures/Users.json";
import {
  createChaosWorkFlow,
  reRunChaosWorkFlow,
  updateChaosWorkflow,
  deleteChaosWorkflow,
  createManifestTemplate,
} from "../../../fixtures/graphql/mutation";
import {
  getCluster,
  getWorkflowRuns,
  ListWorkflow,
  ListManifestTemplate,
  GetTemplateManifestByID,
} from "../../../fixtures/graphql/queries";

let project1Id, project2Id, cluster1Id, workflow1Id, template1Id;
before("Clear database", () => {
  cy.task("clearDB")
    .then(() => {
      return cy.createAgent("a1");
    })
    .then((res) => {
      return cy.task("getAdminProject");
    })
    .then((res) => {
      return cy.securityCheckSetup(res._id, res.name);
    })
    .then((createdSetupVariable) => {
      project1Id = createdSetupVariable.project1Id;
      project2Id = createdSetupVariable.project2Id;
    })
    .then(() => {
      cy.requestLogin(user.AdminName, user.AdminPassword);
    })
    .then(() => {
      cy.request({
        method: "POST",
        url: Cypress.env("apiURL") + "/query",
        body: {
          operationName: "getCluster",
          variables: {
            project_id: project1Id,
          },
          query: getCluster,
        },
      }).then((res) => {
        cluster1Id = res.body.data.getCluster[0].cluster_id;
      });
    });
});

describe("Testing chaos workflow api", () => {
  it("Creating chaos workflow with different workflow_name in manifest [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "createChaosWorkFlow",
        variables: {
          input: {
            workflow_manifest:
              '{\n  "apiVersion": "argoproj.io/v1alpha1",\n  "kind": "Workflow",\n  "metadata": {\n    "name": "custom-chaos-workflow-1",\n    "namespace": "litmus",\n    "labels": {\n      "subject": "custom-chaos-workflow_litmus"\n    }\n  },\n  "spec": {\n    "arguments": {\n      "parameters": [\n        {\n          "name": "adminModeNamespace",\n          "value": "litmus"\n        }\n      ]\n    },\n    "entrypoint": "custom-chaos",\n    "securityContext": {\n      "runAsNonRoot": true,\n      "runAsUser": 1000\n    },\n    "serviceAccountName": "argo-chaos",\n    "templates": [\n      {\n        "name": "custom-chaos",\n        "steps": [\n          [\n            {\n              "name": "install-chaos-experiments",\n              "template": "install-chaos-experiments"\n            }\n          ],\n          [\n            {\n              "name": "pod-delete",\n              "template": "pod-delete"\n            }\n          ]\n        ]\n      },\n      {\n        "name": "install-chaos-experiments",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\ndescription:\\n  message: |\\n    Deletes a pod belonging to a deployment/statefulset/daemonset\\nkind: ChaosExperiment\\nmetadata:\\n  name: pod-delete\\n  labels:\\n    name: pod-delete\\n    app.kubernetes.io/part-of: litmus\\n    app.kubernetes.io/component: chaosexperiment\\n    app.kubernetes.io/version: 2.5.0\\nspec:\\n  definition:\\n    scope: Namespaced\\n    permissions:\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods\\n        verbs:\\n          - create\\n          - delete\\n          - get\\n          - list\\n          - patch\\n          - update\\n          - deletecollection\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - events\\n        verbs:\\n          - create\\n          - get\\n          - list\\n          - patch\\n          - update\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - configmaps\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/log\\n        verbs:\\n          - get\\n          - list\\n          - watch\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/exec\\n        verbs:\\n          - get\\n          - list\\n          - create\\n      - apiGroups:\\n          - apps\\n        resources:\\n          - deployments\\n          - statefulsets\\n          - replicasets\\n          - daemonsets\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - apps.openshift.io\\n        resources:\\n          - deploymentconfigs\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - replicationcontrollers\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - argoproj.io\\n        resources:\\n          - rollouts\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - batch\\n        resources:\\n          - jobs\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - delete\\n          - deletecollection\\n      - apiGroups:\\n          - litmuschaos.io\\n        resources:\\n          - chaosengines\\n          - chaosexperiments\\n          - chaosresults\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - patch\\n          - update\\n          - delete\\n    image: litmuschaos/go-runner:2.5.0\\n    imagePullPolicy: Always\\n    args:\\n      - -c\\n      - ./experiments -name pod-delete\\n    command:\\n      - /bin/bash\\n    env:\\n      - name: TOTAL_CHAOS_DURATION\\n        value: \\"15\\"\\n      - name: RAMP_TIME\\n        value: \\"\\"\\n      - name: FORCE\\n        value: \\"true\\"\\n      - name: CHAOS_INTERVAL\\n        value: \\"5\\"\\n      - name: PODS_AFFECTED_PERC\\n        value: \\"\\"\\n      - name: LIB\\n        value: litmus\\n      - name: TARGET_PODS\\n        value: \\"\\"\\n      - name: SEQUENCE\\n        value: parallel\\n    labels:\\n      name: pod-delete\\n      app.kubernetes.io/part-of: litmus\\n      app.kubernetes.io/component: experiment-job\\n      app.kubernetes.io/version: 2.5.0\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "kubectl apply -f /tmp/pod-delete.yaml -n {{workflow.parameters.adminModeNamespace}} |  sleep 30"\n          ],\n          "command": [\n            "sh",\n            "-c"\n          ],\n          "image": "litmuschaos/k8s:latest"\n        }\n      },\n      {\n        "name": "pod-delete",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/chaosengine-pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\nkind: ChaosEngine\\nmetadata:\\n  namespace: \\"{{workflow.parameters.adminModeNamespace}}\\"\\n  generateName: pod-delete\\n  labels:\\n    instance_id: 4178162f-b069-4e49-9561-1694e5823ca0\\n    workflow_name: custom-chaos-workflow-1645874354\\nspec:\\n  appinfo:\\n    appns: default\\n    applabel: app=nginx\\n    appkind: deployment\\n  engineState: active\\n  chaosServiceAccount: litmus-admin\\n  experiments:\\n    - name: pod-delete\\n      spec:\\n        components:\\n          env:\\n            - name: TOTAL_CHAOS_DURATION\\n              value: \\"30\\"\\n            - name: CHAOS_INTERVAL\\n              value: \\"10\\"\\n            - name: FORCE\\n              value: \\"false\\"\\n            - name: PODS_AFFECTED_PERC\\n              value: \\"\\"\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "-file=/tmp/chaosengine-pod-delete.yaml",\n            "-saveName=/tmp/engine-name"\n          ],\n          "image": "litmuschaos/litmus-checker:latest"\n        }\n      }\n    ]\n  }\n}',
            cronSyntax: "",
            workflow_name: "custom-chaos-workflow-2",
            workflow_description: "Custom Chaos Workflow",
            isCustomWorkflow: true,
            weightages: [
              {
                experiment_name: "pod-delete",
                weightage: 10,
              },
            ],
            project_id: project1Id,
            cluster_id: cluster1Id,
          },
        },
        query: createChaosWorkFlow,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "Workflow name doesn't match");
    });
  });

  it("Creating chaos workflow with projectId and clusterId mismatch [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "createChaosWorkFlow",
        variables: {
          input: {
            workflow_manifest:
              '{\n  "apiVersion": "argoproj.io/v1alpha1",\n  "kind": "Workflow",\n  "metadata": {\n    "name": "custom-chaos-workflow-1",\n    "namespace": "litmus",\n    "labels": {\n      "subject": "custom-chaos-workflow_litmus"\n    }\n  },\n  "spec": {\n    "arguments": {\n      "parameters": [\n        {\n          "name": "adminModeNamespace",\n          "value": "litmus"\n        }\n      ]\n    },\n    "entrypoint": "custom-chaos",\n    "securityContext": {\n      "runAsNonRoot": true,\n      "runAsUser": 1000\n    },\n    "serviceAccountName": "argo-chaos",\n    "templates": [\n      {\n        "name": "custom-chaos",\n        "steps": [\n          [\n            {\n              "name": "install-chaos-experiments",\n              "template": "install-chaos-experiments"\n            }\n          ],\n          [\n            {\n              "name": "pod-delete",\n              "template": "pod-delete"\n            }\n          ]\n        ]\n      },\n      {\n        "name": "install-chaos-experiments",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\ndescription:\\n  message: |\\n    Deletes a pod belonging to a deployment/statefulset/daemonset\\nkind: ChaosExperiment\\nmetadata:\\n  name: pod-delete\\n  labels:\\n    name: pod-delete\\n    app.kubernetes.io/part-of: litmus\\n    app.kubernetes.io/component: chaosexperiment\\n    app.kubernetes.io/version: 2.5.0\\nspec:\\n  definition:\\n    scope: Namespaced\\n    permissions:\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods\\n        verbs:\\n          - create\\n          - delete\\n          - get\\n          - list\\n          - patch\\n          - update\\n          - deletecollection\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - events\\n        verbs:\\n          - create\\n          - get\\n          - list\\n          - patch\\n          - update\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - configmaps\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/log\\n        verbs:\\n          - get\\n          - list\\n          - watch\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/exec\\n        verbs:\\n          - get\\n          - list\\n          - create\\n      - apiGroups:\\n          - apps\\n        resources:\\n          - deployments\\n          - statefulsets\\n          - replicasets\\n          - daemonsets\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - apps.openshift.io\\n        resources:\\n          - deploymentconfigs\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - replicationcontrollers\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - argoproj.io\\n        resources:\\n          - rollouts\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - batch\\n        resources:\\n          - jobs\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - delete\\n          - deletecollection\\n      - apiGroups:\\n          - litmuschaos.io\\n        resources:\\n          - chaosengines\\n          - chaosexperiments\\n          - chaosresults\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - patch\\n          - update\\n          - delete\\n    image: litmuschaos/go-runner:2.5.0\\n    imagePullPolicy: Always\\n    args:\\n      - -c\\n      - ./experiments -name pod-delete\\n    command:\\n      - /bin/bash\\n    env:\\n      - name: TOTAL_CHAOS_DURATION\\n        value: \\"15\\"\\n      - name: RAMP_TIME\\n        value: \\"\\"\\n      - name: FORCE\\n        value: \\"true\\"\\n      - name: CHAOS_INTERVAL\\n        value: \\"5\\"\\n      - name: PODS_AFFECTED_PERC\\n        value: \\"\\"\\n      - name: LIB\\n        value: litmus\\n      - name: TARGET_PODS\\n        value: \\"\\"\\n      - name: SEQUENCE\\n        value: parallel\\n    labels:\\n      name: pod-delete\\n      app.kubernetes.io/part-of: litmus\\n      app.kubernetes.io/component: experiment-job\\n      app.kubernetes.io/version: 2.5.0\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "kubectl apply -f /tmp/pod-delete.yaml -n {{workflow.parameters.adminModeNamespace}} |  sleep 30"\n          ],\n          "command": [\n            "sh",\n            "-c"\n          ],\n          "image": "litmuschaos/k8s:latest"\n        }\n      },\n      {\n        "name": "pod-delete",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/chaosengine-pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\nkind: ChaosEngine\\nmetadata:\\n  namespace: \\"{{workflow.parameters.adminModeNamespace}}\\"\\n  generateName: pod-delete\\n  labels:\\n    instance_id: 4178162f-b069-4e49-9561-1694e5823ca0\\n    workflow_name: custom-chaos-workflow-1645874354\\nspec:\\n  appinfo:\\n    appns: default\\n    applabel: app=nginx\\n    appkind: deployment\\n  engineState: active\\n  chaosServiceAccount: litmus-admin\\n  experiments:\\n    - name: pod-delete\\n      spec:\\n        components:\\n          env:\\n            - name: TOTAL_CHAOS_DURATION\\n              value: \\"30\\"\\n            - name: CHAOS_INTERVAL\\n              value: \\"10\\"\\n            - name: FORCE\\n              value: \\"false\\"\\n            - name: PODS_AFFECTED_PERC\\n              value: \\"\\"\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "-file=/tmp/chaosengine-pod-delete.yaml",\n            "-saveName=/tmp/engine-name"\n          ],\n          "image": "litmuschaos/litmus-checker:latest"\n        }\n      }\n    ]\n  }\n}',
            cronSyntax: "",
            workflow_name: "custom-chaos-workflow-1",
            workflow_description: "Custom Chaos Workflow",
            isCustomWorkflow: true,
            weightages: [
              {
                experiment_name: "pod-delete",
                weightage: 10,
              },
            ],
            project_id: project2Id,
            cluster_id: cluster1Id,
          },
        },
        query: createChaosWorkFlow,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Creating chaos workflow", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "createChaosWorkFlow",
        variables: {
          input: {
            workflow_manifest:
              '{\n  "apiVersion": "argoproj.io/v1alpha1",\n  "kind": "Workflow",\n  "metadata": {\n    "name": "custom-chaos-workflow-1",\n    "namespace": "litmus",\n    "labels": {\n      "subject": "custom-chaos-workflow_litmus"\n    }\n  },\n  "spec": {\n    "arguments": {\n      "parameters": [\n        {\n          "name": "adminModeNamespace",\n          "value": "litmus"\n        }\n      ]\n    },\n    "entrypoint": "custom-chaos",\n    "securityContext": {\n      "runAsNonRoot": true,\n      "runAsUser": 1000\n    },\n    "serviceAccountName": "argo-chaos",\n    "templates": [\n      {\n        "name": "custom-chaos",\n        "steps": [\n          [\n            {\n              "name": "install-chaos-experiments",\n              "template": "install-chaos-experiments"\n            }\n          ],\n          [\n            {\n              "name": "pod-delete",\n              "template": "pod-delete"\n            }\n          ]\n        ]\n      },\n      {\n        "name": "install-chaos-experiments",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\ndescription:\\n  message: |\\n    Deletes a pod belonging to a deployment/statefulset/daemonset\\nkind: ChaosExperiment\\nmetadata:\\n  name: pod-delete\\n  labels:\\n    name: pod-delete\\n    app.kubernetes.io/part-of: litmus\\n    app.kubernetes.io/component: chaosexperiment\\n    app.kubernetes.io/version: 2.5.0\\nspec:\\n  definition:\\n    scope: Namespaced\\n    permissions:\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods\\n        verbs:\\n          - create\\n          - delete\\n          - get\\n          - list\\n          - patch\\n          - update\\n          - deletecollection\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - events\\n        verbs:\\n          - create\\n          - get\\n          - list\\n          - patch\\n          - update\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - configmaps\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/log\\n        verbs:\\n          - get\\n          - list\\n          - watch\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/exec\\n        verbs:\\n          - get\\n          - list\\n          - create\\n      - apiGroups:\\n          - apps\\n        resources:\\n          - deployments\\n          - statefulsets\\n          - replicasets\\n          - daemonsets\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - apps.openshift.io\\n        resources:\\n          - deploymentconfigs\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - replicationcontrollers\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - argoproj.io\\n        resources:\\n          - rollouts\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - batch\\n        resources:\\n          - jobs\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - delete\\n          - deletecollection\\n      - apiGroups:\\n          - litmuschaos.io\\n        resources:\\n          - chaosengines\\n          - chaosexperiments\\n          - chaosresults\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - patch\\n          - update\\n          - delete\\n    image: litmuschaos/go-runner:2.5.0\\n    imagePullPolicy: Always\\n    args:\\n      - -c\\n      - ./experiments -name pod-delete\\n    command:\\n      - /bin/bash\\n    env:\\n      - name: TOTAL_CHAOS_DURATION\\n        value: \\"15\\"\\n      - name: RAMP_TIME\\n        value: \\"\\"\\n      - name: FORCE\\n        value: \\"true\\"\\n      - name: CHAOS_INTERVAL\\n        value: \\"5\\"\\n      - name: PODS_AFFECTED_PERC\\n        value: \\"\\"\\n      - name: LIB\\n        value: litmus\\n      - name: TARGET_PODS\\n        value: \\"\\"\\n      - name: SEQUENCE\\n        value: parallel\\n    labels:\\n      name: pod-delete\\n      app.kubernetes.io/part-of: litmus\\n      app.kubernetes.io/component: experiment-job\\n      app.kubernetes.io/version: 2.5.0\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "kubectl apply -f /tmp/pod-delete.yaml -n {{workflow.parameters.adminModeNamespace}} |  sleep 30"\n          ],\n          "command": [\n            "sh",\n            "-c"\n          ],\n          "image": "litmuschaos/k8s:latest"\n        }\n      },\n      {\n        "name": "pod-delete",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/chaosengine-pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\nkind: ChaosEngine\\nmetadata:\\n  namespace: \\"{{workflow.parameters.adminModeNamespace}}\\"\\n  generateName: pod-delete\\n  labels:\\n    instance_id: 4178162f-b069-4e49-9561-1694e5823ca0\\n    workflow_name: custom-chaos-workflow-1645874354\\nspec:\\n  appinfo:\\n    appns: default\\n    applabel: app=nginx\\n    appkind: deployment\\n  engineState: active\\n  chaosServiceAccount: litmus-admin\\n  experiments:\\n    - name: pod-delete\\n      spec:\\n        components:\\n          env:\\n            - name: TOTAL_CHAOS_DURATION\\n              value: \\"30\\"\\n            - name: CHAOS_INTERVAL\\n              value: \\"10\\"\\n            - name: FORCE\\n              value: \\"false\\"\\n            - name: PODS_AFFECTED_PERC\\n              value: \\"\\"\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "-file=/tmp/chaosengine-pod-delete.yaml",\n            "-saveName=/tmp/engine-name"\n          ],\n          "image": "litmuschaos/litmus-checker:latest"\n        }\n      }\n    ]\n  }\n}',
            cronSyntax: "",
            workflow_name: "custom-chaos-workflow-1",
            workflow_description: "Custom Chaos Workflow",
            isCustomWorkflow: true,
            weightages: [
              {
                experiment_name: "pod-delete",
                weightage: 10,
              },
            ],
            project_id: project1Id,
            cluster_id: cluster1Id,
          },
        },
        query: createChaosWorkFlow,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.createChaosWorkFlow.workflow_id"
      );
      workflow1Id = res.body.data.createChaosWorkFlow.workflow_id;
    });
  });

  /*it("Creating workflow with existing workflow name [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "createChaosWorkFlow",
        variables: {
          input: {
            workflow_manifest:
              '{\n  "apiVersion": "argoproj.io/v1alpha1",\n  "kind": "Workflow",\n  "metadata": {\n    "name": "custom-chaos-workflow-1",\n    "namespace": "litmus",\n    "labels": {\n      "subject": "custom-chaos-workflow_litmus"\n    }\n  },\n  "spec": {\n    "arguments": {\n      "parameters": [\n        {\n          "name": "adminModeNamespace",\n          "value": "litmus"\n        }\n      ]\n    },\n    "entrypoint": "custom-chaos",\n    "securityContext": {\n      "runAsNonRoot": true,\n      "runAsUser": 1000\n    },\n    "serviceAccountName": "argo-chaos",\n    "templates": [\n      {\n        "name": "custom-chaos",\n        "steps": [\n          [\n            {\n              "name": "install-chaos-experiments",\n              "template": "install-chaos-experiments"\n            }\n          ],\n          [\n            {\n              "name": "pod-delete",\n              "template": "pod-delete"\n            }\n          ]\n        ]\n      },\n      {\n        "name": "install-chaos-experiments",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\ndescription:\\n  message: |\\n    Deletes a pod belonging to a deployment/statefulset/daemonset\\nkind: ChaosExperiment\\nmetadata:\\n  name: pod-delete\\n  labels:\\n    name: pod-delete\\n    app.kubernetes.io/part-of: litmus\\n    app.kubernetes.io/component: chaosexperiment\\n    app.kubernetes.io/version: 2.5.0\\nspec:\\n  definition:\\n    scope: Namespaced\\n    permissions:\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods\\n        verbs:\\n          - create\\n          - delete\\n          - get\\n          - list\\n          - patch\\n          - update\\n          - deletecollection\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - events\\n        verbs:\\n          - create\\n          - get\\n          - list\\n          - patch\\n          - update\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - configmaps\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/log\\n        verbs:\\n          - get\\n          - list\\n          - watch\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/exec\\n        verbs:\\n          - get\\n          - list\\n          - create\\n      - apiGroups:\\n          - apps\\n        resources:\\n          - deployments\\n          - statefulsets\\n          - replicasets\\n          - daemonsets\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - apps.openshift.io\\n        resources:\\n          - deploymentconfigs\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - replicationcontrollers\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - argoproj.io\\n        resources:\\n          - rollouts\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - batch\\n        resources:\\n          - jobs\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - delete\\n          - deletecollection\\n      - apiGroups:\\n          - litmuschaos.io\\n        resources:\\n          - chaosengines\\n          - chaosexperiments\\n          - chaosresults\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - patch\\n          - update\\n          - delete\\n    image: litmuschaos/go-runner:2.5.0\\n    imagePullPolicy: Always\\n    args:\\n      - -c\\n      - ./experiments -name pod-delete\\n    command:\\n      - /bin/bash\\n    env:\\n      - name: TOTAL_CHAOS_DURATION\\n        value: \\"15\\"\\n      - name: RAMP_TIME\\n        value: \\"\\"\\n      - name: FORCE\\n        value: \\"true\\"\\n      - name: CHAOS_INTERVAL\\n        value: \\"5\\"\\n      - name: PODS_AFFECTED_PERC\\n        value: \\"\\"\\n      - name: LIB\\n        value: litmus\\n      - name: TARGET_PODS\\n        value: \\"\\"\\n      - name: SEQUENCE\\n        value: parallel\\n    labels:\\n      name: pod-delete\\n      app.kubernetes.io/part-of: litmus\\n      app.kubernetes.io/component: experiment-job\\n      app.kubernetes.io/version: 2.5.0\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "kubectl apply -f /tmp/pod-delete.yaml -n {{workflow.parameters.adminModeNamespace}} |  sleep 30"\n          ],\n          "command": [\n            "sh",\n            "-c"\n          ],\n          "image": "litmuschaos/k8s:latest"\n        }\n      },\n      {\n        "name": "pod-delete",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/chaosengine-pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\nkind: ChaosEngine\\nmetadata:\\n  namespace: \\"{{workflow.parameters.adminModeNamespace}}\\"\\n  generateName: pod-delete\\n  labels:\\n    instance_id: 4178162f-b069-4e49-9561-1694e5823ca0\\n    workflow_name: custom-chaos-workflow-1645874354\\nspec:\\n  appinfo:\\n    appns: default\\n    applabel: app=nginx\\n    appkind: deployment\\n  engineState: active\\n  chaosServiceAccount: litmus-admin\\n  experiments:\\n    - name: pod-delete\\n      spec:\\n        components:\\n          env:\\n            - name: TOTAL_CHAOS_DURATION\\n              value: \\"30\\"\\n            - name: CHAOS_INTERVAL\\n              value: \\"10\\"\\n            - name: FORCE\\n              value: \\"false\\"\\n            - name: PODS_AFFECTED_PERC\\n              value: \\"\\"\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "-file=/tmp/chaosengine-pod-delete.yaml",\n            "-saveName=/tmp/engine-name"\n          ],\n          "image": "litmuschaos/litmus-checker:latest"\n        }\n      }\n    ]\n  }\n}',
            cronSyntax: "",
            workflow_name: "custom-chaos-workflow-1",
            workflow_description: "Custom Chaos Workflow",
            isCustomWorkflow: true,
            weightages: [
              {
                experiment_name: "pod-delete",
                weightage: 10,
              },
            ],
            project_id: project1Id,
            cluster_id: cluster1Id,
          },
        },
        query: createChaosWorkFlow,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });*/

  it("Fetching all chaos workflow runs", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "getWorkflowRuns",
        variables: {
          workflowRunsInput: {
            project_id: project1Id,
            workflow_run_ids: [],
            workflow_ids: [],
          },
        },
        query: getWorkflowRuns,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.getWorkflowRuns.total_no_of_workflow_runs"
      );
      expect(res.body.data.getWorkflowRuns.total_no_of_workflow_runs).to.be.a(
        "number"
      );
    });
  });

  it("Fetching all chaos workflows", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "ListWorkflow",
        variables: {
          workflowInput: {
            project_id: project1Id,
          },
        },
        query: ListWorkflow,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.ListWorkflow.total_no_of_workflows"
      );
      expect(res.body.data.ListWorkflow.total_no_of_workflows).to.be.a(
        "number"
      );
    });
  });

  /*it("Rerun a chaos workflow", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "reRunChaosWorkFlow",
        variables: {
          workflowID: workflow1Id,
          projectID: project1Id,
        },
        query: reRunChaosWorkFlow,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.reRunChaosWorkFlow");
    });
  });*/

  /*it("Updating chaos workflow without workflow_id [Should not be possible]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "updateChaosWorkflow",
        variables: {
          input: {
            workflow_manifest:
              '{\n  "apiVersion": "argoproj.io/v1alpha1",\n  "kind": "Workflow",\n  "metadata": {\n    "name": "updated-custom-chaos-workflow",\n    "namespace": "litmus",\n    "labels": {\n      "subject": "custom-chaos-workflow_litmus"\n    }\n  },\n  "spec": {\n    "arguments": {\n      "parameters": [\n        {\n          "name": "adminModeNamespace",\n          "value": "litmus"\n        }\n      ]\n    },\n    "entrypoint": "custom-chaos",\n    "securityContext": {\n      "runAsNonRoot": true,\n      "runAsUser": 1000\n    },\n    "serviceAccountName": "argo-chaos",\n    "templates": [\n      {\n        "name": "custom-chaos",\n        "steps": [\n          [\n            {\n              "name": "install-chaos-experiments",\n              "template": "install-chaos-experiments"\n            }\n          ],\n          [\n            {\n              "name": "pod-delete",\n              "template": "pod-delete"\n            }\n          ]\n        ]\n      },\n      {\n        "name": "install-chaos-experiments",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\ndescription:\\n  message: |\\n    Deletes a pod belonging to a deployment/statefulset/daemonset\\nkind: ChaosExperiment\\nmetadata:\\n  name: pod-delete\\n  labels:\\n    name: pod-delete\\n    app.kubernetes.io/part-of: litmus\\n    app.kubernetes.io/component: chaosexperiment\\n    app.kubernetes.io/version: 2.5.0\\nspec:\\n  definition:\\n    scope: Namespaced\\n    permissions:\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods\\n        verbs:\\n          - create\\n          - delete\\n          - get\\n          - list\\n          - patch\\n          - update\\n          - deletecollection\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - events\\n        verbs:\\n          - create\\n          - get\\n          - list\\n          - patch\\n          - update\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - configmaps\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/log\\n        verbs:\\n          - get\\n          - list\\n          - watch\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/exec\\n        verbs:\\n          - get\\n          - list\\n          - create\\n      - apiGroups:\\n          - apps\\n        resources:\\n          - deployments\\n          - statefulsets\\n          - replicasets\\n          - daemonsets\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - apps.openshift.io\\n        resources:\\n          - deploymentconfigs\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - replicationcontrollers\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - argoproj.io\\n        resources:\\n          - rollouts\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - batch\\n        resources:\\n          - jobs\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - delete\\n          - deletecollection\\n      - apiGroups:\\n          - litmuschaos.io\\n        resources:\\n          - chaosengines\\n          - chaosexperiments\\n          - chaosresults\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - patch\\n          - update\\n          - delete\\n    image: litmuschaos/go-runner:2.5.0\\n    imagePullPolicy: Always\\n    args:\\n      - -c\\n      - ./experiments -name pod-delete\\n    command:\\n      - /bin/bash\\n    env:\\n      - name: TOTAL_CHAOS_DURATION\\n        value: \\"15\\"\\n      - name: RAMP_TIME\\n        value: \\"\\"\\n      - name: FORCE\\n        value: \\"true\\"\\n      - name: CHAOS_INTERVAL\\n        value: \\"5\\"\\n      - name: PODS_AFFECTED_PERC\\n        value: \\"\\"\\n      - name: LIB\\n        value: litmus\\n      - name: TARGET_PODS\\n        value: \\"\\"\\n      - name: SEQUENCE\\n        value: parallel\\n    labels:\\n      name: pod-delete\\n      app.kubernetes.io/part-of: litmus\\n      app.kubernetes.io/component: experiment-job\\n      app.kubernetes.io/version: 2.5.0\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "kubectl apply -f /tmp/pod-delete.yaml -n {{workflow.parameters.adminModeNamespace}} |  sleep 30"\n          ],\n          "command": [\n            "sh",\n            "-c"\n          ],\n          "image": "litmuschaos/k8s:latest"\n        }\n      },\n      {\n        "name": "pod-delete",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/chaosengine-pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\nkind: ChaosEngine\\nmetadata:\\n  namespace: \\"{{workflow.parameters.adminModeNamespace}}\\"\\n  generateName: pod-delete\\n  labels:\\n    instance_id: 4178162f-b069-4e49-9561-1694e5823ca0\\n    workflow_name: custom-chaos-workflow-1645874354\\nspec:\\n  appinfo:\\n    appns: default\\n    applabel: app=nginx\\n    appkind: deployment\\n  engineState: active\\n  chaosServiceAccount: litmus-admin\\n  experiments:\\n    - name: pod-delete\\n      spec:\\n        components:\\n          env:\\n            - name: TOTAL_CHAOS_DURATION\\n              value: \\"30\\"\\n            - name: CHAOS_INTERVAL\\n              value: \\"10\\"\\n            - name: FORCE\\n              value: \\"false\\"\\n            - name: PODS_AFFECTED_PERC\\n              value: \\"\\"\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "-file=/tmp/chaosengine-pod-delete.yaml",\n            "-saveName=/tmp/engine-name"\n          ],\n          "image": "litmuschaos/litmus-checker:latest"\n        }\n      }\n    ]\n  }\n}',
            cronSyntax: "",
            workflow_name: "updated-custom-chaos-workflow",
            workflow_description: "Updated Custom Chaos Workflow",
            isCustomWorkflow: true,
            weightages: [
              {
                experiment_name: "pod-delete",
                weightage: 10,
              },
            ],
            project_id: project1Id,
            cluster_id: cluster1Id,
          },
        },
        query: updateChaosWorkflow,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });*/

  it("Updating chaos workflow", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "updateChaosWorkflow",
        variables: {
          input: {
            workflow_id: workflow1Id,
            workflow_manifest:
              '{\n  "apiVersion": "argoproj.io/v1alpha1",\n  "kind": "Workflow",\n  "metadata": {\n    "name": "updated-custom-chaos-workflow",\n    "namespace": "litmus",\n    "labels": {\n      "subject": "custom-chaos-workflow_litmus"\n    }\n  },\n  "spec": {\n    "arguments": {\n      "parameters": [\n        {\n          "name": "adminModeNamespace",\n          "value": "litmus"\n        }\n      ]\n    },\n    "entrypoint": "custom-chaos",\n    "securityContext": {\n      "runAsNonRoot": true,\n      "runAsUser": 1000\n    },\n    "serviceAccountName": "argo-chaos",\n    "templates": [\n      {\n        "name": "custom-chaos",\n        "steps": [\n          [\n            {\n              "name": "install-chaos-experiments",\n              "template": "install-chaos-experiments"\n            }\n          ],\n          [\n            {\n              "name": "pod-delete",\n              "template": "pod-delete"\n            }\n          ]\n        ]\n      },\n      {\n        "name": "install-chaos-experiments",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\ndescription:\\n  message: |\\n    Deletes a pod belonging to a deployment/statefulset/daemonset\\nkind: ChaosExperiment\\nmetadata:\\n  name: pod-delete\\n  labels:\\n    name: pod-delete\\n    app.kubernetes.io/part-of: litmus\\n    app.kubernetes.io/component: chaosexperiment\\n    app.kubernetes.io/version: 2.5.0\\nspec:\\n  definition:\\n    scope: Namespaced\\n    permissions:\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods\\n        verbs:\\n          - create\\n          - delete\\n          - get\\n          - list\\n          - patch\\n          - update\\n          - deletecollection\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - events\\n        verbs:\\n          - create\\n          - get\\n          - list\\n          - patch\\n          - update\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - configmaps\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/log\\n        verbs:\\n          - get\\n          - list\\n          - watch\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/exec\\n        verbs:\\n          - get\\n          - list\\n          - create\\n      - apiGroups:\\n          - apps\\n        resources:\\n          - deployments\\n          - statefulsets\\n          - replicasets\\n          - daemonsets\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - apps.openshift.io\\n        resources:\\n          - deploymentconfigs\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - replicationcontrollers\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - argoproj.io\\n        resources:\\n          - rollouts\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - batch\\n        resources:\\n          - jobs\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - delete\\n          - deletecollection\\n      - apiGroups:\\n          - litmuschaos.io\\n        resources:\\n          - chaosengines\\n          - chaosexperiments\\n          - chaosresults\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - patch\\n          - update\\n          - delete\\n    image: litmuschaos/go-runner:2.5.0\\n    imagePullPolicy: Always\\n    args:\\n      - -c\\n      - ./experiments -name pod-delete\\n    command:\\n      - /bin/bash\\n    env:\\n      - name: TOTAL_CHAOS_DURATION\\n        value: \\"15\\"\\n      - name: RAMP_TIME\\n        value: \\"\\"\\n      - name: FORCE\\n        value: \\"true\\"\\n      - name: CHAOS_INTERVAL\\n        value: \\"5\\"\\n      - name: PODS_AFFECTED_PERC\\n        value: \\"\\"\\n      - name: LIB\\n        value: litmus\\n      - name: TARGET_PODS\\n        value: \\"\\"\\n      - name: SEQUENCE\\n        value: parallel\\n    labels:\\n      name: pod-delete\\n      app.kubernetes.io/part-of: litmus\\n      app.kubernetes.io/component: experiment-job\\n      app.kubernetes.io/version: 2.5.0\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "kubectl apply -f /tmp/pod-delete.yaml -n {{workflow.parameters.adminModeNamespace}} |  sleep 30"\n          ],\n          "command": [\n            "sh",\n            "-c"\n          ],\n          "image": "litmuschaos/k8s:latest"\n        }\n      },\n      {\n        "name": "pod-delete",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/chaosengine-pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\nkind: ChaosEngine\\nmetadata:\\n  namespace: \\"{{workflow.parameters.adminModeNamespace}}\\"\\n  generateName: pod-delete\\n  labels:\\n    instance_id: 4178162f-b069-4e49-9561-1694e5823ca0\\n    workflow_name: custom-chaos-workflow-1645874354\\nspec:\\n  appinfo:\\n    appns: default\\n    applabel: app=nginx\\n    appkind: deployment\\n  engineState: active\\n  chaosServiceAccount: litmus-admin\\n  experiments:\\n    - name: pod-delete\\n      spec:\\n        components:\\n          env:\\n            - name: TOTAL_CHAOS_DURATION\\n              value: \\"30\\"\\n            - name: CHAOS_INTERVAL\\n              value: \\"10\\"\\n            - name: FORCE\\n              value: \\"false\\"\\n            - name: PODS_AFFECTED_PERC\\n              value: \\"\\"\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "-file=/tmp/chaosengine-pod-delete.yaml",\n            "-saveName=/tmp/engine-name"\n          ],\n          "image": "litmuschaos/litmus-checker:latest"\n        }\n      }\n    ]\n  }\n}',
            cronSyntax: "",
            workflow_name: "updated-custom-chaos-workflow",
            workflow_description: "Updated Custom Chaos Workflow",
            isCustomWorkflow: true,
            weightages: [
              {
                experiment_name: "pod-delete",
                weightage: 10,
              },
            ],
            project_id: project1Id,
            cluster_id: cluster1Id,
          },
        },
        query: updateChaosWorkflow,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.updateChaosWorkflow.workflow_id"
      );
      expect(res.body.data.updateChaosWorkflow.workflow_id).to.eq(workflow1Id);
    });
  });

  /*it("Deleting chaos workflow", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "deleteChaosWorkflow",
        variables: {
          projectID: project1Id,
          workflowID: workflow1Id,
        },
        query: deleteChaosWorkflow,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.deleteChaosWorkflow");
      expect(res.body.data.deleteChaosWorkflow).to.eq(true);
    });
  });*/

  it("Test to save a scheduled workflow as a template", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "createManifestTemplate",
        variables: {
          templateInput: {
            manifest:
              'kind: CronWorkflow\napiVersion: argoproj.io/v1alpha1\nmetadata:\n  name: podtato-head-1646030868\n  namespace: litmus\n  creationTimestamp: null\n  labels:\n    subject: podtato-head_litmus\n    workflows.argoproj.io/controller-instanceid: 53fdf999-8650-4e91-8231-3e2b503d7c9b\nspec:\n  workflowSpec:\n    templates:\n      - name: argowf-chaos\n        inputs: {}\n        outputs: {}\n        metadata: {}\n        steps:\n          - - name: install-application\n              template: install-application\n              arguments: {}\n          - - name: install-chaos-experiments\n              template: install-chaos-experiments\n              arguments: {}\n          - - name: pod-delete\n              template: pod-delete\n              arguments: {}\n          - - name: revert-chaos\n              template: revert-chaos\n              arguments: {}\n            - name: delete-application\n              template: delete-application\n              arguments: {}\n      - name: install-application\n        inputs: {}\n        outputs: {}\n        metadata: {}\n        container:\n          name: ""\n          image: litmuschaos/litmus-app-deployer:2.5.0\n          args:\n            - -namespace={{workflow.parameters.adminModeNamespace}}\n            - -typeName=resilient\n            - -operation=apply\n            - -timeout=400\n            - -app=podtato-head\n            - -scope=namespace\n          resources: {}\n      - name: install-chaos-experiments\n        inputs: {}\n        outputs: {}\n        metadata: {}\n        container:\n          name: ""\n          image: litmuschaos/k8s:2.5.0\n          command:\n            - sh\n            - -c\n          args:\n            - kubectl apply -f\n              https://hub.litmuschaos.io/api/chaos/2.5.0?file=charts/generic/experiments.yaml\n              -n {{workflow.parameters.adminModeNamespace}} ; sleep 30\n          resources: {}\n      - name: pod-delete\n        inputs:\n          artifacts:\n            - name: pod-delete\n              path: /tmp/chaosengine.yaml\n              raw:\n                data: >\n                  apiVersion: litmuschaos.io/v1alpha1\n\n                  kind: ChaosEngine\n\n                  metadata:\n                    namespace: "{{workflow.parameters.adminModeNamespace}}"\n                    labels:\n                      instance_id: 4c4b7707-112c-4809-8749-19e46aaab769\n                      workflow_name: podtato-head-1646030868\n                    generateName: podtato-main-pod-delete-chaos\n                  spec:\n                    appinfo:\n                      appns: "{{workflow.parameters.adminModeNamespace}}"\n                      applabel: name=podtato-main\n                      appkind: deployment\n                    engineState: active\n                    chaosServiceAccount: litmus-admin\n                    jobCleanUpPolicy: retain\n                    components:\n                      runner:\n                        imagePullPolicy: Always\n                    experiments:\n                      - name: pod-delete\n                        spec:\n                          probe:\n                            - name: check-podtato-main-access-url\n                              type: httpProbe\n                              httpProbe/inputs:\n                                url: http://podtato-main.{{workflow.parameters.adminModeNamespace}}.svc.cluster.local:9000\n                                insecureSkipVerify: false\n                                method:\n                                  get:\n                                    criteria: ==\n                                    responseCode: "200"\n                              mode: Continuous\n                              runProperties:\n                                probeTimeout: 1\n                                interval: 1\n                                retry: 1\n                          components:\n                            env:\n                              - name: TOTAL_CHAOS_DURATION\n                                value: "30"\n                              - name: CHAOS_INTERVAL\n                                value: "10"\n                              - name: FORCE\n                                value: "false"\n        outputs: {}\n        metadata:\n          labels:\n            weight: "10"\n        container:\n          name: ""\n          image: litmuschaos/litmus-checker:2.5.0\n          args:\n            - -file=/tmp/chaosengine.yaml\n            - -saveName=/tmp/engine-name\n          resources: {}\n      - name: delete-application\n        inputs: {}\n        outputs: {}\n        metadata: {}\n        container:\n          name: ""\n          image: litmuschaos/litmus-app-deployer:2.5.0\n          args:\n            - -namespace={{workflow.parameters.adminModeNamespace}}\n            - -typeName=resilient\n            - -operation=delete\n            - -app=podtato-head\n          resources: {}\n      - name: revert-chaos\n        inputs: {}\n        outputs: {}\n        metadata: {}\n        container:\n          name: ""\n          image: litmuschaos/k8s:2.5.0\n          command:\n            - sh\n            - -c\n          args:\n            - "kubectl delete chaosengine -l \'instance_id in\n              (4c4b7707-112c-4809-8749-19e46aaab769, )\' -n\n              {{workflow.parameters.adminModeNamespace}} "\n          resources: {}\n    entrypoint: argowf-chaos\n    arguments:\n      parameters:\n        - name: adminModeNamespace\n          value: litmus\n    serviceAccountName: argo-chaos\n    securityContext:\n      runAsUser: 1000\n      runAsNonRoot: true\n  schedule: 20 12 * * 0-6\n  concurrencyPolicy: Forbid\n  startingDeadlineSeconds: 0\n  timezone: Asia/Calcutta\n  workflowMetadata:\n    creationTimestamp: null\n    labels:\n      cluster_id: 53fdf999-8650-4e91-8231-3e2b503d7c9b\n      workflow_id: c85987c1-30d1-4479-b0bb-712ad03638ae\n      workflows.argoproj.io/controller-instanceid: 53fdf999-8650-4e91-8231-3e2b503d7c9b\nstatus:\n  ? active\n  ? lastScheduledTime\n  ? conditions\n',
            template_name: "test-template-1",
            template_description: "test template 1",
            project_id: project1Id,
            isCustomWorkflow: false,
          },
        },
        query: createManifestTemplate,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.createManifestTemplate.template_id"
      );
      template1Id = res.body.data.createManifestTemplate.template_id;
    });
  });

  it("Test to list all available template manifests", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "ListManifestTemplate",
        variables: {
          project_id: project1Id,
        },
        query: ListManifestTemplate,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.ListManifestTemplate[0].template_id"
      );
      expect(res.body.data.ListManifestTemplate[0].template_id).to.eq(
        template1Id
      );
    });
  });

  it("Test to get template manifests by template_id", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + "/query",
      body: {
        operationName: "GetTemplateManifestByID",
        variables: {
          projectID: project1Id,
          template_id: template1Id,
        },
        query: GetTemplateManifestByID,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.GetTemplateManifestByID.template_id"
      );
      expect(res.body).to.have.nested.property(
        "data.GetTemplateManifestByID.manifest"
      );
      expect(res.body.data.GetTemplateManifestByID.template_id).to.eq(
        template1Id
      );
    });
  });
});
