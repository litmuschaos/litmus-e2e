# LitmusChaos E2E

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus-e2e.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus-e2e?ref=badge_shield)

**Latest Pipeline Status**

| Pipeline        | Status                                                                                                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pod-Level       | [![pipeline status](https://github.com/litmuschaos/litmus-e2e/actions/workflows/scheduled-pod-level-pipeline.yml/badge.svg)](https://github.com/litmuschaos/litmus-e2e/actions/workflows/scheduled-pod-level-pipeline.yml)   |
| Node-Level      | [![pipeline status](https://github.com/litmuschaos/litmus-e2e/actions/workflows/scheduled-node-level-pipeline.yml/badge.svg)](https://github.com/litmuschaos/litmus-e2e/actions/workflows/scheduled-node-level-pipeline.yml) |
| Component-Level | [![pipeline status](https://github.com/litmuschaos/litmus-e2e/actions/workflows/scheduled-component-pipeline.yml/badge.svg)](https://github.com/litmuschaos/litmus-e2e/actions/workflows/scheduled-component-pipeline.yml)   |
| Litmus-Portal   | [![pipeline status](https://github.com/litmuschaos/litmus-e2e/actions/workflows/scheduled-Portal-pipeline.yml/badge.svg)](https://github.com/litmuschaos/litmus-e2e/actions/workflows/scheduled-Portal-pipeline.yml)         |

This repository contains the Litmus E2E pipelines for testing the chaos and litmus components. It includes BDDs for all litmus experiments and UI E2E-tests for the litmus portal.

## Pipeline Details

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

## Pipeline Execution Details

Visit [LitmusChaos CI](https://litmuschaos.github.io/litmus-e2e) to get the pipeline execution details.

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
