---
title: Home
layout: template
filename: index
---

# **LitmusChaos E2E**

LitmusChaos is a toolset to do [cloud-native chaos engineering](https://dev.to/umamukkara/chaos-engineering-for-cloud-native-systems-2fjn). It takes a cloud-native approach to create, manage and monitor chaos. Chaos is orchestrated using the Kubernetes Custom Resource Definitions (CRDs) which are called ChaosEngine, ChaosExperiment and ChaosResult. For a higher performance we need these components to work accurately according to our hypothesis between every upgrade and updates which brings the need of <b>LitmusChaos E2E</b>.<br>
The Litmus E2E is broadly divided in 2 categories Generic & Litmus-Portal.

## **Pipeline Details**

<table>
  <tr>
    <th>Pipeline</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Pod-Level pipeline</td>
    <td>It contains the test cases (GO BDDs) for all pod-level generic experiments.</td>
  </tr>
  <tr>
    <td>Node-Level pipeline</td>
    <td>It contains the test cases (GO BDDs) for node-level generic experiments. 
  </tr>
  <tr>
    <td>Component-Level pipeline</td>
    <td>It contains the test cases (GO BDDs) for component-level generic experiments. 
  </tr>
  <tr>
    <td>Litmus-Portal pipeline</td>
    <td>It contains different UI E2E test cases for litmus portal</td>
  </tr>
</table>

# **How to view the details of the last few pipeline runs?**

To view the details of the last few pipelines runs:

- Select the buttons from header whose pipeline details you want.
  > For Pod-Level/Node-Level/Component-Level pipelines, click on `Generic` Button.
- Inside it contains the details of every job along with pipeline details.

# Pod-Level E2E Pipeline:

The Pod-Level pipeline covers the tests for litmus pod-level generic experiments which include some before and after chaos validation and performance checks for different litmus components.

### Different Stages:

<table style="width:100%">
  <tr>
    <th>Stages</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Setup Litmus Infra</td>
    <td>This is the Litmus installation stage, in this stage the crds rbacs and the operator are created.</td>
  </tr>
  <tr>
    <td>Setup App Deployment</td>
    <td>This is the application deployment stage. The application under chaos is deployed and the liveness test for the application is also performed in this stage.</td>
  </tr>
  <tr>
    <td>Pod-Level Test</td>
    <td>This stage includes the creation of experiments,engine and positive and negative test cases for the pod-level experiments.</td>
  </tr>
  <tr>
    <td>Experiment Tunables</td>
    <td>This stage includes tests for different tunable variables of pod-level experiments.</td>
  </tr>
  <tr>
    <td>App-cleanup</td>
    <td>This is the application cleanup stage in which all the applications under tests are removed.</td>
  </tr>
  <tr>
    <td>Litmus-Cleanup</td>
    <td>In this stage, All the litmus components such as experiments, engines & results are removed.</td>
  </tr>
</table>

# Node-level E2E Pipeline

The Node-Level pipeline covers the tests for litmus node-level generic experiments which include some before and after chaos validation and performance checks for different litmus components.

### Different Stages:

<table style="width:100%">
  <tr>
    <th>Stages</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Setup Litmus Infra</td>
    <td>This is the Litmus installation stage, in this stage the crds rbacs and the operator are created.</td>
  </tr>
  <tr>
    <td>Setup App Deployment</td>
    <td>This is the application deployment stage. The application under chaos is deployed and the liveness test for the application is also performed in this stage.</td>
  </tr>
  <tr>
    <td>Node-Level Test</td>
    <td>This stage includes the creation of experiments,engine and positive and negative test cases for the node-level experiments.</td>
  </tr>
  <tr>
    <td>Engine Test</td>
    <td>This stage includes the test to check application-info tunablility for ChaosEngines.</td>
  </tr>
  <tr>
    <td>App-cleanup</td>
    <td>This is the application cleanup stage in which all the applications under tests are removed.</td>
  </tr>
  <tr>
    <td>Litmus-Cleanup</td>
    <td>In this stage, All the litmus components such as experiments, engines & results are removed.</td>
  </tr>
</table>

# Component-level E2E Pipeline

The Component-Level pipeline covers the tests for litmus component-level generic experiments which include some before and after chaos validation and performance checks for different litmus components.

### Different Stages:

<table style="width:100%">
  <tr>
    <th>Stages</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Setup Litmus Infra</td>
    <td>This is the Litmus installation stage, in this stage the crds rbacs and the operator are created.</td>
  </tr>
  <tr>
    <td>Setup App Deployment</td>
    <td>This is the application deployment stage. The application under chaos is deployed and the liveness test for the application is also performed in this stage.</td>
  </tr>
  <tr>
    <td>Component-Level Test</td>
    <td>This stage includes the creation of experiments,engine and positive and negative test cases for the component-level experiments.</td>
  </tr>
  <tr>
    <td>App-cleanup</td>
    <td>This is the application cleanup stage in which all the applications under tests are removed.</td>
  </tr>
  <tr>
    <td>Litmus-Cleanup</td>
    <td>In this stage, All the litmus components such as experiments, engines & results are removed.</td>
  </tr>
</table>

# **Litmus Portal E2E Pipeline**

It contains litmus-portal BDD tests using Cypress and Bash Scripts. Currently, it contains Cypress E2E tests for functionalities like login, Welcome Modal, User management, Workflow Scheduling and Browse Workflows/Schedules.

## **Different Stages:**

<table style="width:100%">
  <tr>
    <th>Stages</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Cluster-Setup</td>
    <td>This Step is used to create a Testing cluster (For Nightly builds, 3-node K3S Cluster) for deploying Litmus-Portal.</td>
  </tr>
  <tr>
    <td>Portal-Setup</td>
    <td>This Step is used to deploy litmus-portal on created cluster and verifies all control-plane resources are configured correctly and are in Ready State.</td>
  </tr>
  <tr>
    <td>Litmus-Portal Authentication Tests</td>
    <td>This step is used for testing Portal Login/Onboarding Features.</td>
  </tr>
  <tr>
    <td>Execution plane components check</td>
    <td>This step is used for verifying all execution plane components created after Portal login such as Workflow Controller, Subscriber and Event-tracker, etc.</td>
  </tr>
  <tr>
    <td>Post Login features Tests</td>
    <td>This step is used for testing post login features such as Workflow Scheduling, Teaming, Account Settings and Browse Workflows, etc.</td>
  </tr>
  <tr>
    <td>Portal-Cleanup</td>
    <td>This stage is used for uninstalling litmus-portal and verifying the uninstallation.</td>
  </tr>
  <tr>
    <td>Cluster Cleanup</td>
    <td>In this stage, The Cluster created for testing is destroyed and artifacts (Screenshots of failed Cypress tests) are saved for later use.</td>
  </tr>
</table>
