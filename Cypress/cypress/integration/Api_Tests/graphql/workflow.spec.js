/// <reference types="Cypress" />

import {
  CREATE_WORKFLOW,
  RERUN_CHAOS_WORKFLOW,
  UPDATE_SCHEDULE,
  DELETE_WORKFLOW,
  ADD_WORKFLOW_TEMPLATE,
} from "../../../fixtures/graphql/mutations";
import {
  WORKFLOW_DETAILS,
  GET_WORKFLOW_DETAILS,
  GET_MANIFEST_TEMPLATE,
  GET_TEMPLATE_BY_ID,
} from "../../../fixtures/graphql/queries";
import endpoints from "../../../fixtures/endpoints";

let adminProjectId, adminAccessToken, cluster1Id, workflow1Id, template1Id;

before("Clear database", () => {
  cy.initialRBACSetup(true).then((data) => {
    adminProjectId = data.adminProjectId;
    adminAccessToken = data.adminAccessToken;
    cluster1Id = data.cluster1Id;
  });
});

describe("Testing chaos workflow api", () => {
  it("Creating chaos workflow with different workflow_name in manifest [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "createChaosWorkFlow",
        variables: {
          request: {
            workflowManifest:
              '{\n  "apiVersion": "argoproj.io/v1alpha1",\n  "kind": "Workflow",\n  "metadata": {\n    "name": "custom-chaos-workflow-1",\n    "namespace": "litmus",\n    "labels": {\n      "subject": "custom-chaos-workflow_litmus"\n    }\n  },\n  "spec": {\n    "arguments": {\n      "parameters": [\n        {\n          "name": "adminModeNamespace",\n          "value": "litmus"\n        }\n      ]\n    },\n    "entrypoint": "custom-chaos",\n    "securityContext": {\n      "runAsNonRoot": true,\n      "runAsUser": 1000\n    },\n    "serviceAccountName": "argo-chaos",\n    "templates": [\n      {\n        "name": "custom-chaos",\n        "steps": [\n          [\n            {\n              "name": "install-chaos-experiments",\n              "template": "install-chaos-experiments"\n            }\n          ],\n          [\n            {\n              "name": "pod-delete",\n              "template": "pod-delete"\n            }\n          ]\n        ]\n      },\n      {\n        "name": "install-chaos-experiments",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\ndescription:\\n  message: |\\n    Deletes a pod belonging to a deployment/statefulset/daemonset\\nkind: ChaosExperiment\\nmetadata:\\n  name: pod-delete\\n  labels:\\n    name: pod-delete\\n    app.kubernetes.io/part-of: litmus\\n    app.kubernetes.io/component: chaosexperiment\\n    app.kubernetes.io/version: 2.5.0\\nspec:\\n  definition:\\n    scope: Namespaced\\n    permissions:\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods\\n        verbs:\\n          - create\\n          - delete\\n          - get\\n          - list\\n          - patch\\n          - update\\n          - deletecollection\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - events\\n        verbs:\\n          - create\\n          - get\\n          - list\\n          - patch\\n          - update\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - configmaps\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/log\\n        verbs:\\n          - get\\n          - list\\n          - watch\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/exec\\n        verbs:\\n          - get\\n          - list\\n          - create\\n      - apiGroups:\\n          - apps\\n        resources:\\n          - deployments\\n          - statefulsets\\n          - replicasets\\n          - daemonsets\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - apps.openshift.io\\n        resources:\\n          - deploymentconfigs\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - replicationcontrollers\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - argoproj.io\\n        resources:\\n          - rollouts\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - batch\\n        resources:\\n          - jobs\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - delete\\n          - deletecollection\\n      - apiGroups:\\n          - litmuschaos.io\\n        resources:\\n          - chaosengines\\n          - chaosexperiments\\n          - chaosresults\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - patch\\n          - update\\n          - delete\\n    image: litmuschaos/go-runner:2.5.0\\n    imagePullPolicy: Always\\n    args:\\n      - -c\\n      - ./experiments -name pod-delete\\n    command:\\n      - /bin/bash\\n    env:\\n      - name: TOTAL_CHAOS_DURATION\\n        value: \\"15\\"\\n      - name: RAMP_TIME\\n        value: \\"\\"\\n      - name: FORCE\\n        value: \\"true\\"\\n      - name: CHAOS_INTERVAL\\n        value: \\"5\\"\\n      - name: PODS_AFFECTED_PERC\\n        value: \\"\\"\\n      - name: LIB\\n        value: litmus\\n      - name: TARGET_PODS\\n        value: \\"\\"\\n      - name: SEQUENCE\\n        value: parallel\\n    labels:\\n      name: pod-delete\\n      app.kubernetes.io/part-of: litmus\\n      app.kubernetes.io/component: experiment-job\\n      app.kubernetes.io/version: 2.5.0\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "kubectl apply -f /tmp/pod-delete.yaml -n {{workflow.parameters.adminModeNamespace}} |  sleep 30"\n          ],\n          "command": [\n            "sh",\n            "-c"\n          ],\n          "image": "litmuschaos/k8s:latest"\n        }\n      },\n      {\n        "name": "pod-delete",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/chaosengine-pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\nkind: ChaosEngine\\nmetadata:\\n  namespace: \\"{{workflow.parameters.adminModeNamespace}}\\"\\n  generateName: pod-delete\\n  labels:\\n    instance_id: 4178162f-b069-4e49-9561-1694e5823ca0\\n    workflow_name: custom-chaos-workflow-1645874354\\nspec:\\n  appinfo:\\n    appns: default\\n    applabel: app=nginx\\n    appkind: deployment\\n  engineState: active\\n  chaosServiceAccount: litmus-admin\\n  experiments:\\n    - name: pod-delete\\n      spec:\\n        components:\\n          env:\\n            - name: TOTAL_CHAOS_DURATION\\n              value: \\"30\\"\\n            - name: CHAOS_INTERVAL\\n              value: \\"10\\"\\n            - name: FORCE\\n              value: \\"false\\"\\n            - name: PODS_AFFECTED_PERC\\n              value: \\"\\"\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "-file=/tmp/chaosengine-pod-delete.yaml",\n            "-saveName=/tmp/engine-name"\n          ],\n          "image": "litmuschaos/litmus-checker:latest"\n        }\n      }\n    ]\n  }\n}',
            cronSyntax: "",
            workflowName: "custom-chaos-workflow-2",
            workflowDescription: "Custom Chaos Workflow",
            isCustomWorkflow: true,
            weightages: [
              {
                experimentName: "pod-delete",
                weightage: 10,
              },
            ],
            projectID: adminProjectId,
            clusterID: cluster1Id,
          },
        },
        query: CREATE_WORKFLOW,
      },
      headers: {
        authorization: adminAccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "Workflow name doesn't match");
    });
  });

  it("Creating chaos workflow with projectId and clusterId mismatch [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "createChaosWorkFlow",
        variables: {
          request: {
            workflowManifest:
              '{\n  "apiVersion": "argoproj.io/v1alpha1",\n  "kind": "Workflow",\n  "metadata": {\n    "name": "custom-chaos-workflow-1",\n    "namespace": "litmus",\n    "labels": {\n      "subject": "custom-chaos-workflow_litmus"\n    }\n  },\n  "spec": {\n    "arguments": {\n      "parameters": [\n        {\n          "name": "adminModeNamespace",\n          "value": "litmus"\n        }\n      ]\n    },\n    "entrypoint": "custom-chaos",\n    "securityContext": {\n      "runAsNonRoot": true,\n      "runAsUser": 1000\n    },\n    "serviceAccountName": "argo-chaos",\n    "templates": [\n      {\n        "name": "custom-chaos",\n        "steps": [\n          [\n            {\n              "name": "install-chaos-experiments",\n              "template": "install-chaos-experiments"\n            }\n          ],\n          [\n            {\n              "name": "pod-delete",\n              "template": "pod-delete"\n            }\n          ]\n        ]\n      },\n      {\n        "name": "install-chaos-experiments",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\ndescription:\\n  message: |\\n    Deletes a pod belonging to a deployment/statefulset/daemonset\\nkind: ChaosExperiment\\nmetadata:\\n  name: pod-delete\\n  labels:\\n    name: pod-delete\\n    app.kubernetes.io/part-of: litmus\\n    app.kubernetes.io/component: chaosexperiment\\n    app.kubernetes.io/version: 2.5.0\\nspec:\\n  definition:\\n    scope: Namespaced\\n    permissions:\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods\\n        verbs:\\n          - create\\n          - delete\\n          - get\\n          - list\\n          - patch\\n          - update\\n          - deletecollection\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - events\\n        verbs:\\n          - create\\n          - get\\n          - list\\n          - patch\\n          - update\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - configmaps\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/log\\n        verbs:\\n          - get\\n          - list\\n          - watch\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/exec\\n        verbs:\\n          - get\\n          - list\\n          - create\\n      - apiGroups:\\n          - apps\\n        resources:\\n          - deployments\\n          - statefulsets\\n          - replicasets\\n          - daemonsets\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - apps.openshift.io\\n        resources:\\n          - deploymentconfigs\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - replicationcontrollers\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - argoproj.io\\n        resources:\\n          - rollouts\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - batch\\n        resources:\\n          - jobs\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - delete\\n          - deletecollection\\n      - apiGroups:\\n          - litmuschaos.io\\n        resources:\\n          - chaosengines\\n          - chaosexperiments\\n          - chaosresults\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - patch\\n          - update\\n          - delete\\n    image: litmuschaos/go-runner:2.5.0\\n    imagePullPolicy: Always\\n    args:\\n      - -c\\n      - ./experiments -name pod-delete\\n    command:\\n      - /bin/bash\\n    env:\\n      - name: TOTAL_CHAOS_DURATION\\n        value: \\"15\\"\\n      - name: RAMP_TIME\\n        value: \\"\\"\\n      - name: FORCE\\n        value: \\"true\\"\\n      - name: CHAOS_INTERVAL\\n        value: \\"5\\"\\n      - name: PODS_AFFECTED_PERC\\n        value: \\"\\"\\n      - name: LIB\\n        value: litmus\\n      - name: TARGET_PODS\\n        value: \\"\\"\\n      - name: SEQUENCE\\n        value: parallel\\n    labels:\\n      name: pod-delete\\n      app.kubernetes.io/part-of: litmus\\n      app.kubernetes.io/component: experiment-job\\n      app.kubernetes.io/version: 2.5.0\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "kubectl apply -f /tmp/pod-delete.yaml -n {{workflow.parameters.adminModeNamespace}} |  sleep 30"\n          ],\n          "command": [\n            "sh",\n            "-c"\n          ],\n          "image": "litmuschaos/k8s:latest"\n        }\n      },\n      {\n        "name": "pod-delete",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/chaosengine-pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\nkind: ChaosEngine\\nmetadata:\\n  namespace: \\"{{workflow.parameters.adminModeNamespace}}\\"\\n  generateName: pod-delete\\n  labels:\\n    instance_id: 4178162f-b069-4e49-9561-1694e5823ca0\\n    workflow_name: custom-chaos-workflow-1645874354\\nspec:\\n  appinfo:\\n    appns: default\\n    applabel: app=nginx\\n    appkind: deployment\\n  engineState: active\\n  chaosServiceAccount: litmus-admin\\n  experiments:\\n    - name: pod-delete\\n      spec:\\n        components:\\n          env:\\n            - name: TOTAL_CHAOS_DURATION\\n              value: \\"30\\"\\n            - name: CHAOS_INTERVAL\\n              value: \\"10\\"\\n            - name: FORCE\\n              value: \\"false\\"\\n            - name: PODS_AFFECTED_PERC\\n              value: \\"\\"\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "-file=/tmp/chaosengine-pod-delete.yaml",\n            "-saveName=/tmp/engine-name"\n          ],\n          "image": "litmuschaos/litmus-checker:latest"\n        }\n      }\n    ]\n  }\n}',
            cronSyntax: "",
            workflowName: "custom-chaos-workflow-1",
            workflowDescription: "Custom Chaos Workflow",
            isCustomWorkflow: true,
            weightages: [
              {
                experimentName: "pod-delete",
                weightage: 10,
              },
            ],
            projectID: adminProjectId,
            clusterID: cluster1Id,
          },
        },
        query: CREATE_WORKFLOW,
      },
      headers: {
        authorization: adminAccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Creating chaos workflow", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "createChaosWorkFlow",
        variables: {
          request: {
            workflowManifest:
              '{\n  "apiVersion": "argoproj.io/v1alpha1",\n  "kind": "Workflow",\n  "metadata": {\n    "name": "custom-chaos-workflow-1",\n    "namespace": "litmus",\n    "labels": {\n      "subject": "custom-chaos-workflow_litmus"\n    }\n  },\n  "spec": {\n    "arguments": {\n      "parameters": [\n        {\n          "name": "adminModeNamespace",\n          "value": "litmus"\n        }\n      ]\n    },\n    "entrypoint": "custom-chaos",\n    "securityContext": {\n      "runAsNonRoot": true,\n      "runAsUser": 1000\n    },\n    "serviceAccountName": "argo-chaos",\n    "templates": [\n      {\n        "name": "custom-chaos",\n        "steps": [\n          [\n            {\n              "name": "install-chaos-experiments",\n              "template": "install-chaos-experiments"\n            }\n          ],\n          [\n            {\n              "name": "pod-delete",\n              "template": "pod-delete"\n            }\n          ]\n        ]\n      },\n      {\n        "name": "install-chaos-experiments",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\ndescription:\\n  message: |\\n    Deletes a pod belonging to a deployment/statefulset/daemonset\\nkind: ChaosExperiment\\nmetadata:\\n  name: pod-delete\\n  labels:\\n    name: pod-delete\\n    app.kubernetes.io/part-of: litmus\\n    app.kubernetes.io/component: chaosexperiment\\n    app.kubernetes.io/version: 2.5.0\\nspec:\\n  definition:\\n    scope: Namespaced\\n    permissions:\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods\\n        verbs:\\n          - create\\n          - delete\\n          - get\\n          - list\\n          - patch\\n          - update\\n          - deletecollection\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - events\\n        verbs:\\n          - create\\n          - get\\n          - list\\n          - patch\\n          - update\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - configmaps\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/log\\n        verbs:\\n          - get\\n          - list\\n          - watch\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/exec\\n        verbs:\\n          - get\\n          - list\\n          - create\\n      - apiGroups:\\n          - apps\\n        resources:\\n          - deployments\\n          - statefulsets\\n          - replicasets\\n          - daemonsets\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - apps.openshift.io\\n        resources:\\n          - deploymentconfigs\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - replicationcontrollers\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - argoproj.io\\n        resources:\\n          - rollouts\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - batch\\n        resources:\\n          - jobs\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - delete\\n          - deletecollection\\n      - apiGroups:\\n          - litmuschaos.io\\n        resources:\\n          - chaosengines\\n          - chaosexperiments\\n          - chaosresults\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - patch\\n          - update\\n          - delete\\n    image: litmuschaos/go-runner:2.5.0\\n    imagePullPolicy: Always\\n    args:\\n      - -c\\n      - ./experiments -name pod-delete\\n    command:\\n      - /bin/bash\\n    env:\\n      - name: TOTAL_CHAOS_DURATION\\n        value: \\"15\\"\\n      - name: RAMP_TIME\\n        value: \\"\\"\\n      - name: FORCE\\n        value: \\"true\\"\\n      - name: CHAOS_INTERVAL\\n        value: \\"5\\"\\n      - name: PODS_AFFECTED_PERC\\n        value: \\"\\"\\n      - name: LIB\\n        value: litmus\\n      - name: TARGET_PODS\\n        value: \\"\\"\\n      - name: SEQUENCE\\n        value: parallel\\n    labels:\\n      name: pod-delete\\n      app.kubernetes.io/part-of: litmus\\n      app.kubernetes.io/component: experiment-job\\n      app.kubernetes.io/version: 2.5.0\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "kubectl apply -f /tmp/pod-delete.yaml -n {{workflow.parameters.adminModeNamespace}} |  sleep 30"\n          ],\n          "command": [\n            "sh",\n            "-c"\n          ],\n          "image": "litmuschaos/k8s:latest"\n        }\n      },\n      {\n        "name": "pod-delete",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/chaosengine-pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\nkind: ChaosEngine\\nmetadata:\\n  namespace: \\"{{workflow.parameters.adminModeNamespace}}\\"\\n  generateName: pod-delete\\n  labels:\\n    instance_id: 4178162f-b069-4e49-9561-1694e5823ca0\\n    workflow_name: custom-chaos-workflow-1645874354\\nspec:\\n  appinfo:\\n    appns: default\\n    applabel: app=nginx\\n    appkind: deployment\\n  engineState: active\\n  chaosServiceAccount: litmus-admin\\n  experiments:\\n    - name: pod-delete\\n      spec:\\n        components:\\n          env:\\n            - name: TOTAL_CHAOS_DURATION\\n              value: \\"30\\"\\n            - name: CHAOS_INTERVAL\\n              value: \\"10\\"\\n            - name: FORCE\\n              value: \\"false\\"\\n            - name: PODS_AFFECTED_PERC\\n              value: \\"\\"\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "-file=/tmp/chaosengine-pod-delete.yaml",\n            "-saveName=/tmp/engine-name"\n          ],\n          "image": "litmuschaos/litmus-checker:latest"\n        }\n      }\n    ]\n  }\n}',
            cronSyntax: "",
            workflowName: "custom-chaos-workflow-1",
            workflowDescription: "Custom Chaos Workflow",
            isCustomWorkflow: true,
            weightages: [
              {
                experimentName: "pod-delete",
                weightage: 10,
              },
            ],
            projectID: adminProjectId,
            clusterID: cluster1Id,
          },
        },
        query: CREATE_WORKFLOW,
      },
      headers: {
        authorization: adminAccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.createChaosWorkFlow.workflowID"
      );
      workflow1Id = res.body.data.createChaosWorkFlow.workflowID;
    });
  });

  it("Creating workflow with existing workflow name [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "createChaosWorkFlow",
        variables: {
          request: {
            workflowManifest:
              '{\n  "apiVersion": "argoproj.io/v1alpha1",\n  "kind": "Workflow",\n  "metadata": {\n    "name": "custom-chaos-workflow-1",\n    "namespace": "litmus",\n    "labels": {\n      "subject": "custom-chaos-workflow_litmus"\n    }\n  },\n  "spec": {\n    "arguments": {\n      "parameters": [\n        {\n          "name": "adminModeNamespace",\n          "value": "litmus"\n        }\n      ]\n    },\n    "entrypoint": "custom-chaos",\n    "securityContext": {\n      "runAsNonRoot": true,\n      "runAsUser": 1000\n    },\n    "serviceAccountName": "argo-chaos",\n    "templates": [\n      {\n        "name": "custom-chaos",\n        "steps": [\n          [\n            {\n              "name": "install-chaos-experiments",\n              "template": "install-chaos-experiments"\n            }\n          ],\n          [\n            {\n              "name": "pod-delete",\n              "template": "pod-delete"\n            }\n          ]\n        ]\n      },\n      {\n        "name": "install-chaos-experiments",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\ndescription:\\n  message: |\\n    Deletes a pod belonging to a deployment/statefulset/daemonset\\nkind: ChaosExperiment\\nmetadata:\\n  name: pod-delete\\n  labels:\\n    name: pod-delete\\n    app.kubernetes.io/part-of: litmus\\n    app.kubernetes.io/component: chaosexperiment\\n    app.kubernetes.io/version: 2.5.0\\nspec:\\n  definition:\\n    scope: Namespaced\\n    permissions:\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods\\n        verbs:\\n          - create\\n          - delete\\n          - get\\n          - list\\n          - patch\\n          - update\\n          - deletecollection\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - events\\n        verbs:\\n          - create\\n          - get\\n          - list\\n          - patch\\n          - update\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - configmaps\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/log\\n        verbs:\\n          - get\\n          - list\\n          - watch\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/exec\\n        verbs:\\n          - get\\n          - list\\n          - create\\n      - apiGroups:\\n          - apps\\n        resources:\\n          - deployments\\n          - statefulsets\\n          - replicasets\\n          - daemonsets\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - apps.openshift.io\\n        resources:\\n          - deploymentconfigs\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - replicationcontrollers\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - argoproj.io\\n        resources:\\n          - rollouts\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - batch\\n        resources:\\n          - jobs\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - delete\\n          - deletecollection\\n      - apiGroups:\\n          - litmuschaos.io\\n        resources:\\n          - chaosengines\\n          - chaosexperiments\\n          - chaosresults\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - patch\\n          - update\\n          - delete\\n    image: litmuschaos/go-runner:2.5.0\\n    imagePullPolicy: Always\\n    args:\\n      - -c\\n      - ./experiments -name pod-delete\\n    command:\\n      - /bin/bash\\n    env:\\n      - name: TOTAL_CHAOS_DURATION\\n        value: \\"15\\"\\n      - name: RAMP_TIME\\n        value: \\"\\"\\n      - name: FORCE\\n        value: \\"true\\"\\n      - name: CHAOS_INTERVAL\\n        value: \\"5\\"\\n      - name: PODS_AFFECTED_PERC\\n        value: \\"\\"\\n      - name: LIB\\n        value: litmus\\n      - name: TARGET_PODS\\n        value: \\"\\"\\n      - name: SEQUENCE\\n        value: parallel\\n    labels:\\n      name: pod-delete\\n      app.kubernetes.io/part-of: litmus\\n      app.kubernetes.io/component: experiment-job\\n      app.kubernetes.io/version: 2.5.0\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "kubectl apply -f /tmp/pod-delete.yaml -n {{workflow.parameters.adminModeNamespace}} |  sleep 30"\n          ],\n          "command": [\n            "sh",\n            "-c"\n          ],\n          "image": "litmuschaos/k8s:latest"\n        }\n      },\n      {\n        "name": "pod-delete",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/chaosengine-pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\nkind: ChaosEngine\\nmetadata:\\n  namespace: \\"{{workflow.parameters.adminModeNamespace}}\\"\\n  generateName: pod-delete\\n  labels:\\n    instance_id: 4178162f-b069-4e49-9561-1694e5823ca0\\n    workflow_name: custom-chaos-workflow-1645874354\\nspec:\\n  appinfo:\\n    appns: default\\n    applabel: app=nginx\\n    appkind: deployment\\n  engineState: active\\n  chaosServiceAccount: litmus-admin\\n  experiments:\\n    - name: pod-delete\\n      spec:\\n        components:\\n          env:\\n            - name: TOTAL_CHAOS_DURATION\\n              value: \\"30\\"\\n            - name: CHAOS_INTERVAL\\n              value: \\"10\\"\\n            - name: FORCE\\n              value: \\"false\\"\\n            - name: PODS_AFFECTED_PERC\\n              value: \\"\\"\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "-file=/tmp/chaosengine-pod-delete.yaml",\n            "-saveName=/tmp/engine-name"\n          ],\n          "image": "litmuschaos/litmus-checker:latest"\n        }\n      }\n    ]\n  }\n}',
            cronSyntax: "",
            workflowName: "custom-chaos-workflow-1",
            workflowDescription: "Custom Chaos Workflow",
            isCustomWorkflow: true,
            weightages: [
              {
                experimentName: "pod-delete",
                weightage: 10,
              },
            ],
            projectID: adminProjectId,
            clusterID: cluster1Id,
          },
        },
        query: CREATE_WORKFLOW,
      },
      headers: {
        authorization: adminAccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Fetching all chaos workflow runs", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "listWorkflowRuns",
        variables: {
          request: {
            projectID: adminProjectId,
            workflowRunIDs: [],
            workflowIDs: [],
          },
        },
        query: WORKFLOW_DETAILS,
      },
      headers: {
        authorization: adminAccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.listWorkflowRuns.totalNoOfWorkflowRuns"
      );
      expect(res.body.data.listWorkflowRuns.totalNoOfWorkflowRuns).to.be.a(
        "number"
      );
    });
  });

  it("Fetching all chaos workflows", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "listWorkflows",
        variables: {
          request: {
            projectID: adminProjectId,
          },
        },
        query: GET_WORKFLOW_DETAILS,
      },
      headers: {
        authorization: adminAccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.listWorkflows.totalNoOfWorkflows"
      );
      expect(res.body.data.listWorkflows.totalNoOfWorkflows).to.be.a("number");
    });
  });

  it("Rerun a chaos workflow", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "reRunChaosWorkFlow",
        variables: {
          workflowID: workflow1Id,
          projectID: adminProjectId,
        },
        query: RERUN_CHAOS_WORKFLOW,
      },
      headers: {
        authorization: adminAccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.reRunChaosWorkFlow");
    });
  });

  it("Updating chaos workflow without workflow_id [Should not be possible]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "updateChaosWorkflow",
        variables: {
          request: {
            workflowManifest:
              '{\n  "apiVersion": "argoproj.io/v1alpha1",\n  "kind": "Workflow",\n  "metadata": {\n    "name": "updated-custom-chaos-workflow",\n    "namespace": "litmus",\n    "labels": {\n      "subject": "custom-chaos-workflow_litmus"\n    }\n  },\n  "spec": {\n    "arguments": {\n      "parameters": [\n        {\n          "name": "adminModeNamespace",\n          "value": "litmus"\n        }\n      ]\n    },\n    "entrypoint": "custom-chaos",\n    "securityContext": {\n      "runAsNonRoot": true,\n      "runAsUser": 1000\n    },\n    "serviceAccountName": "argo-chaos",\n    "templates": [\n      {\n        "name": "custom-chaos",\n        "steps": [\n          [\n            {\n              "name": "install-chaos-experiments",\n              "template": "install-chaos-experiments"\n            }\n          ],\n          [\n            {\n              "name": "pod-delete",\n              "template": "pod-delete"\n            }\n          ]\n        ]\n      },\n      {\n        "name": "install-chaos-experiments",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\ndescription:\\n  message: |\\n    Deletes a pod belonging to a deployment/statefulset/daemonset\\nkind: ChaosExperiment\\nmetadata:\\n  name: pod-delete\\n  labels:\\n    name: pod-delete\\n    app.kubernetes.io/part-of: litmus\\n    app.kubernetes.io/component: chaosexperiment\\n    app.kubernetes.io/version: 2.5.0\\nspec:\\n  definition:\\n    scope: Namespaced\\n    permissions:\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods\\n        verbs:\\n          - create\\n          - delete\\n          - get\\n          - list\\n          - patch\\n          - update\\n          - deletecollection\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - events\\n        verbs:\\n          - create\\n          - get\\n          - list\\n          - patch\\n          - update\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - configmaps\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/log\\n        verbs:\\n          - get\\n          - list\\n          - watch\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/exec\\n        verbs:\\n          - get\\n          - list\\n          - create\\n      - apiGroups:\\n          - apps\\n        resources:\\n          - deployments\\n          - statefulsets\\n          - replicasets\\n          - daemonsets\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - apps.openshift.io\\n        resources:\\n          - deploymentconfigs\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - replicationcontrollers\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - argoproj.io\\n        resources:\\n          - rollouts\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - batch\\n        resources:\\n          - jobs\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - delete\\n          - deletecollection\\n      - apiGroups:\\n          - litmuschaos.io\\n        resources:\\n          - chaosengines\\n          - chaosexperiments\\n          - chaosresults\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - patch\\n          - update\\n          - delete\\n    image: litmuschaos/go-runner:2.5.0\\n    imagePullPolicy: Always\\n    args:\\n      - -c\\n      - ./experiments -name pod-delete\\n    command:\\n      - /bin/bash\\n    env:\\n      - name: TOTAL_CHAOS_DURATION\\n        value: \\"15\\"\\n      - name: RAMP_TIME\\n        value: \\"\\"\\n      - name: FORCE\\n        value: \\"true\\"\\n      - name: CHAOS_INTERVAL\\n        value: \\"5\\"\\n      - name: PODS_AFFECTED_PERC\\n        value: \\"\\"\\n      - name: LIB\\n        value: litmus\\n      - name: TARGET_PODS\\n        value: \\"\\"\\n      - name: SEQUENCE\\n        value: parallel\\n    labels:\\n      name: pod-delete\\n      app.kubernetes.io/part-of: litmus\\n      app.kubernetes.io/component: experiment-job\\n      app.kubernetes.io/version: 2.5.0\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "kubectl apply -f /tmp/pod-delete.yaml -n {{workflow.parameters.adminModeNamespace}} |  sleep 30"\n          ],\n          "command": [\n            "sh",\n            "-c"\n          ],\n          "image": "litmuschaos/k8s:latest"\n        }\n      },\n      {\n        "name": "pod-delete",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/chaosengine-pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\nkind: ChaosEngine\\nmetadata:\\n  namespace: \\"{{workflow.parameters.adminModeNamespace}}\\"\\n  generateName: pod-delete\\n  labels:\\n    instance_id: 4178162f-b069-4e49-9561-1694e5823ca0\\n    workflow_name: custom-chaos-workflow-1645874354\\nspec:\\n  appinfo:\\n    appns: default\\n    applabel: app=nginx\\n    appkind: deployment\\n  engineState: active\\n  chaosServiceAccount: litmus-admin\\n  experiments:\\n    - name: pod-delete\\n      spec:\\n        components:\\n          env:\\n            - name: TOTAL_CHAOS_DURATION\\n              value: \\"30\\"\\n            - name: CHAOS_INTERVAL\\n              value: \\"10\\"\\n            - name: FORCE\\n              value: \\"false\\"\\n            - name: PODS_AFFECTED_PERC\\n              value: \\"\\"\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "-file=/tmp/chaosengine-pod-delete.yaml",\n            "-saveName=/tmp/engine-name"\n          ],\n          "image": "litmuschaos/litmus-checker:latest"\n        }\n      }\n    ]\n  }\n}',
            cronSyntax: "",
            workflowName: "updated-custom-chaos-workflow",
            workflowDescription: "Updated Custom Chaos Workflow",
            isCustomWorkflow: true,
            weightages: [
              {
                experimentName: "pod-delete",
                weightage: 10,
              },
            ],
            projectID: adminProjectId,
            clusterID: cluster1Id,
          },
        },
        query: UPDATE_SCHEDULE,
      },
      headers: {
        authorization: adminAccessToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.validateErrorMessage(res, "permission_denied");
    });
  });

  it("Updating chaos workflow", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "updateChaosWorkflow",
        variables: {
          request: {
            workflowID: workflow1Id,
            workflowManifest:
              '{\n  "apiVersion": "argoproj.io/v1alpha1",\n  "kind": "Workflow",\n  "metadata": {\n    "name": "updated-custom-chaos-workflow",\n    "namespace": "litmus",\n    "labels": {\n      "subject": "custom-chaos-workflow_litmus"\n    }\n  },\n  "spec": {\n    "arguments": {\n      "parameters": [\n        {\n          "name": "adminModeNamespace",\n          "value": "litmus"\n        }\n      ]\n    },\n    "entrypoint": "custom-chaos",\n    "securityContext": {\n      "runAsNonRoot": true,\n      "runAsUser": 1000\n    },\n    "serviceAccountName": "argo-chaos",\n    "templates": [\n      {\n        "name": "custom-chaos",\n        "steps": [\n          [\n            {\n              "name": "install-chaos-experiments",\n              "template": "install-chaos-experiments"\n            }\n          ],\n          [\n            {\n              "name": "pod-delete",\n              "template": "pod-delete"\n            }\n          ]\n        ]\n      },\n      {\n        "name": "install-chaos-experiments",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\ndescription:\\n  message: |\\n    Deletes a pod belonging to a deployment/statefulset/daemonset\\nkind: ChaosExperiment\\nmetadata:\\n  name: pod-delete\\n  labels:\\n    name: pod-delete\\n    app.kubernetes.io/part-of: litmus\\n    app.kubernetes.io/component: chaosexperiment\\n    app.kubernetes.io/version: 2.5.0\\nspec:\\n  definition:\\n    scope: Namespaced\\n    permissions:\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods\\n        verbs:\\n          - create\\n          - delete\\n          - get\\n          - list\\n          - patch\\n          - update\\n          - deletecollection\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - events\\n        verbs:\\n          - create\\n          - get\\n          - list\\n          - patch\\n          - update\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - configmaps\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/log\\n        verbs:\\n          - get\\n          - list\\n          - watch\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - pods/exec\\n        verbs:\\n          - get\\n          - list\\n          - create\\n      - apiGroups:\\n          - apps\\n        resources:\\n          - deployments\\n          - statefulsets\\n          - replicasets\\n          - daemonsets\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - apps.openshift.io\\n        resources:\\n          - deploymentconfigs\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - \\"\\"\\n        resources:\\n          - replicationcontrollers\\n        verbs:\\n          - get\\n          - list\\n      - apiGroups:\\n          - argoproj.io\\n        resources:\\n          - rollouts\\n        verbs:\\n          - list\\n          - get\\n      - apiGroups:\\n          - batch\\n        resources:\\n          - jobs\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - delete\\n          - deletecollection\\n      - apiGroups:\\n          - litmuschaos.io\\n        resources:\\n          - chaosengines\\n          - chaosexperiments\\n          - chaosresults\\n        verbs:\\n          - create\\n          - list\\n          - get\\n          - patch\\n          - update\\n          - delete\\n    image: litmuschaos/go-runner:2.5.0\\n    imagePullPolicy: Always\\n    args:\\n      - -c\\n      - ./experiments -name pod-delete\\n    command:\\n      - /bin/bash\\n    env:\\n      - name: TOTAL_CHAOS_DURATION\\n        value: \\"15\\"\\n      - name: RAMP_TIME\\n        value: \\"\\"\\n      - name: FORCE\\n        value: \\"true\\"\\n      - name: CHAOS_INTERVAL\\n        value: \\"5\\"\\n      - name: PODS_AFFECTED_PERC\\n        value: \\"\\"\\n      - name: LIB\\n        value: litmus\\n      - name: TARGET_PODS\\n        value: \\"\\"\\n      - name: SEQUENCE\\n        value: parallel\\n    labels:\\n      name: pod-delete\\n      app.kubernetes.io/part-of: litmus\\n      app.kubernetes.io/component: experiment-job\\n      app.kubernetes.io/version: 2.5.0\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "kubectl apply -f /tmp/pod-delete.yaml -n {{workflow.parameters.adminModeNamespace}} |  sleep 30"\n          ],\n          "command": [\n            "sh",\n            "-c"\n          ],\n          "image": "litmuschaos/k8s:latest"\n        }\n      },\n      {\n        "name": "pod-delete",\n        "inputs": {\n          "artifacts": [\n            {\n              "name": "pod-delete",\n              "path": "/tmp/chaosengine-pod-delete.yaml",\n              "raw": {\n                "data": "apiVersion: litmuschaos.io/v1alpha1\\nkind: ChaosEngine\\nmetadata:\\n  namespace: \\"{{workflow.parameters.adminModeNamespace}}\\"\\n  generateName: pod-delete\\n  labels:\\n    instance_id: 4178162f-b069-4e49-9561-1694e5823ca0\\n    workflow_name: custom-chaos-workflow-1645874354\\nspec:\\n  appinfo:\\n    appns: default\\n    applabel: app=nginx\\n    appkind: deployment\\n  engineState: active\\n  chaosServiceAccount: litmus-admin\\n  experiments:\\n    - name: pod-delete\\n      spec:\\n        components:\\n          env:\\n            - name: TOTAL_CHAOS_DURATION\\n              value: \\"30\\"\\n            - name: CHAOS_INTERVAL\\n              value: \\"10\\"\\n            - name: FORCE\\n              value: \\"false\\"\\n            - name: PODS_AFFECTED_PERC\\n              value: \\"\\"\\n"\n              }\n            }\n          ]\n        },\n        "container": {\n          "args": [\n            "-file=/tmp/chaosengine-pod-delete.yaml",\n            "-saveName=/tmp/engine-name"\n          ],\n          "image": "litmuschaos/litmus-checker:latest"\n        }\n      }\n    ]\n  }\n}',
            cronSyntax: "",
            workflowName: "updated-custom-chaos-workflow",
            workflowDescription: "Updated Custom Chaos Workflow",
            isCustomWorkflow: true,
            weightages: [
              {
                experimentName: "pod-delete",
                weightage: 10,
              },
            ],
            projectID: adminProjectId,
            clusterID: cluster1Id,
          },
        },
        query: UPDATE_SCHEDULE,
      },
      headers: {
        authorization: adminAccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.updateChaosWorkflow.workflowID"
      );
      expect(res.body.data.updateChaosWorkflow.workflowID).to.eq(workflow1Id);
    });
  });

  it("Deleting chaos workflow", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "deleteChaosWorkflow",
        variables: {
          projectID: adminProjectId,
          workflowID: workflow1Id,
        },
        query: DELETE_WORKFLOW,
      },
      headers: {
        authorization: adminAccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property("data.deleteChaosWorkflow");
      expect(res.body.data.deleteChaosWorkflow).to.eq(true);
    });
  });

  it("Test to save a scheduled workflow as a template", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "createWorkflowTemplate",
        variables: {
          request: {
            manifest:
              'kind: CronWorkflow\napiVersion: argoproj.io/v1alpha1\nmetadata:\n  name: podtato-head-1646030868\n  namespace: litmus\n  creationTimestamp: null\n  labels:\n    subject: podtato-head_litmus\n    workflows.argoproj.io/controller-instanceid: 53fdf999-8650-4e91-8231-3e2b503d7c9b\nspec:\n  workflowSpec:\n    templates:\n      - name: argowf-chaos\n        inputs: {}\n        outputs: {}\n        metadata: {}\n        steps:\n          - - name: install-application\n              template: install-application\n              arguments: {}\n          - - name: install-chaos-experiments\n              template: install-chaos-experiments\n              arguments: {}\n          - - name: pod-delete\n              template: pod-delete\n              arguments: {}\n          - - name: revert-chaos\n              template: revert-chaos\n              arguments: {}\n            - name: delete-application\n              template: delete-application\n              arguments: {}\n      - name: install-application\n        inputs: {}\n        outputs: {}\n        metadata: {}\n        container:\n          name: ""\n          image: litmuschaos/litmus-app-deployer:2.5.0\n          args:\n            - -namespace={{workflow.parameters.adminModeNamespace}}\n            - -typeName=resilient\n            - -operation=apply\n            - -timeout=400\n            - -app=podtato-head\n            - -scope=namespace\n          resources: {}\n      - name: install-chaos-experiments\n        inputs: {}\n        outputs: {}\n        metadata: {}\n        container:\n          name: ""\n          image: litmuschaos/k8s:2.5.0\n          command:\n            - sh\n            - -c\n          args:\n            - kubectl apply -f\n              https://hub.litmuschaos.io/api/chaos/2.5.0?file=charts/generic/experiments.yaml\n              -n {{workflow.parameters.adminModeNamespace}} ; sleep 30\n          resources: {}\n      - name: pod-delete\n        inputs:\n          artifacts:\n            - name: pod-delete\n              path: /tmp/chaosengine.yaml\n              raw:\n                data: >\n                  apiVersion: litmuschaos.io/v1alpha1\n\n                  kind: ChaosEngine\n\n                  metadata:\n                    namespace: "{{workflow.parameters.adminModeNamespace}}"\n                    labels:\n                      instance_id: 4c4b7707-112c-4809-8749-19e46aaab769\n                      workflow_name: podtato-head-1646030868\n                    generateName: podtato-main-pod-delete-chaos\n                  spec:\n                    appinfo:\n                      appns: "{{workflow.parameters.adminModeNamespace}}"\n                      applabel: name=podtato-main\n                      appkind: deployment\n                    engineState: active\n                    chaosServiceAccount: litmus-admin\n                    jobCleanUpPolicy: retain\n                    components:\n                      runner:\n                        imagePullPolicy: Always\n                    experiments:\n                      - name: pod-delete\n                        spec:\n                          probe:\n                            - name: check-podtato-main-access-url\n                              type: httpProbe\n                              httpProbe/inputs:\n                                url: http://podtato-main.{{workflow.parameters.adminModeNamespace}}.svc.cluster.local:9000\n                                insecureSkipVerify: false\n                                method:\n                                  get:\n                                    criteria: ==\n                                    responseCode: "200"\n                              mode: Continuous\n                              runProperties:\n                                probeTimeout: 1\n                                interval: 1\n                                retry: 1\n                          components:\n                            env:\n                              - name: TOTAL_CHAOS_DURATION\n                                value: "30"\n                              - name: CHAOS_INTERVAL\n                                value: "10"\n                              - name: FORCE\n                                value: "false"\n        outputs: {}\n        metadata:\n          labels:\n            weight: "10"\n        container:\n          name: ""\n          image: litmuschaos/litmus-checker:2.5.0\n          args:\n            - -file=/tmp/chaosengine.yaml\n            - -saveName=/tmp/engine-name\n          resources: {}\n      - name: delete-application\n        inputs: {}\n        outputs: {}\n        metadata: {}\n        container:\n          name: ""\n          image: litmuschaos/litmus-app-deployer:2.5.0\n          args:\n            - -namespace={{workflow.parameters.adminModeNamespace}}\n            - -typeName=resilient\n            - -operation=delete\n            - -app=podtato-head\n          resources: {}\n      - name: revert-chaos\n        inputs: {}\n        outputs: {}\n        metadata: {}\n        container:\n          name: ""\n          image: litmuschaos/k8s:2.5.0\n          command:\n            - sh\n            - -c\n          args:\n            - "kubectl delete chaosengine -l \'instance_id in\n              (4c4b7707-112c-4809-8749-19e46aaab769, )\' -n\n              {{workflow.parameters.adminModeNamespace}} "\n          resources: {}\n    entrypoint: argowf-chaos\n    arguments:\n      parameters:\n        - name: adminModeNamespace\n          value: litmus\n    serviceAccountName: argo-chaos\n    securityContext:\n      runAsUser: 1000\n      runAsNonRoot: true\n  schedule: 20 12 * * 0-6\n  concurrencyPolicy: Forbid\n  startingDeadlineSeconds: 0\n  timezone: Asia/Calcutta\n  workflowMetadata:\n    creationTimestamp: null\n    labels:\n      cluster_id: 53fdf999-8650-4e91-8231-3e2b503d7c9b\n      workflow_id: c85987c1-30d1-4479-b0bb-712ad03638ae\n      workflows.argoproj.io/controller-instanceid: 53fdf999-8650-4e91-8231-3e2b503d7c9b\nstatus:\n  ? active\n  ? lastScheduledTime\n  ? conditions\n',
            templateName: "test-template-1",
            templateDescription: "test template 1",
            projectID: adminProjectId,
            isCustomWorkflow: false,
          },
        },
        query: ADD_WORKFLOW_TEMPLATE,
      },
      headers: {
        authorization: adminAccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.createWorkflowTemplate.templateID"
      );
      template1Id = res.body.data.createWorkflowTemplate.templateID;
    });
  });

  it("Test to list all available template manifests", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "listWorkflowManifests",
        variables: {
          projectID: adminProjectId,
        },
        query: GET_MANIFEST_TEMPLATE,
      },
      headers: {
        authorization: adminAccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.listWorkflowManifests[0].templateID"
      );
      expect(res.body.data.listWorkflowManifests[0].templateID).to.eq(
        template1Id
      );
    });
  });

  it("Test to get template manifests by template_id", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiURL") + endpoints.query(),
      body: {
        operationName: "getWorkflowManifestByID",
        variables: {
          projectID: adminProjectId,
          templateID: template1Id,
        },
        query: GET_TEMPLATE_BY_ID,
      },
      headers: {
        authorization: adminAccessToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.nested.property(
        "data.getWorkflowManifestByID.templateID"
      );
      expect(res.body).to.have.nested.property(
        "data.getWorkflowManifestByID.manifest"
      );
      expect(res.body.data.getWorkflowManifestByID.templateID).to.eq(
        template1Id
      );
    });
  });
});
