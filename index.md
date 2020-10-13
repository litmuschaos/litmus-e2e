---
title: Home
layout: template
filename: index
--- 


# **LitmusChaos E2E**

LitmusChaos is a toolset to do [cloud-native chaos engineering](https://dev.to/umamukkara/chaos-engineering-for-cloud-native-systems-2fjn). It takes a cloud-native approach to create, manage and monitor chaos. Chaos is orchestrated using the Kubernetes Custom Resource Definitions (CRDs) which are called ChaosEngine, ChaosExperiment and ChaosResult. For a higher performance we need these components to work accurately according to our hypothesis between every upgrade and updates which brings the need of <b>LitmusChaos E2E</b>.<br>
The Litmus E2E is broadly divided in three categories Generic, OpenEBS. LitmusPortal managed by respective branch in litmus-e2e repository.

## **Branch Details**

<table>
  <tr>
    <th>Branch</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>generic</td>
    <td>It contains the test cases (GO BDDs) for all litmus generic experiments along with litmus component tests.</td>
  </tr>
  <tr>
    <td>openebs</td>
    <td>It contains the test cases (GO BDDs) for Litmus OpenEBS experiment which includes different OpenEBS control plane and data plane tests.</td>
  </tr>
  <tr>
    <td>litmus-portal</td>
    <td>It contains different test cases for litmus portal</td>
  </tr>
</table>

# **How to view the details of the last few pipeline runs?**

To view the details of the last few pipelines runs:

- Select the buttons from header whose pipeline details you want.
- Inside it contains the details of every job along with pipeline details.

# **Generic E2E Pipeline:**

The Generic pipeline covers the test for litmus generic experiments which include some before and after chaos validation checks and performance checks for different litmus components. A sample application nginx is deployed along with nginx service and liveness probe to test the chaos.

## **Different Stages:**

<table style="width:100%">
  <tr>
    <th>Stages</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Setup</td>
    <td>This stage is used for connecting to the OnPrem cluster which is a 4 node cluster(1 master and 3 worker) and clone the litmus-e2e folder</td>
  </tr>
  <tr>
    <td>Install</td>
    <td>This is the Litmus installation stage, in this stage the crds rbacs and the operator are created.</td>
  </tr>
  <tr>
    <td>Deploy</td>
    <td>This is the application deployment stage. The application under chaos is deployed and the liveness test for the application is also performed in this stage.</td>
  </tr>
  <tr>
    <td>Generic-experiment</td>
    <td>This stage includes the creation of experiments and some positive & negative test cases for the experiments.</td>
  </tr>
    <tr>
    <td>Infra-experiment</td>
    <td>This stage includes the creation of node level experiments and some positive & negative test cases for the Infra experiments.</td>
  </tr>  
  <tr>
    <td>App-cleanup</td>
    <td>This is the experiment and application cleanup stage on which all the engines, applications, experiments are removed.</td>
  </tr>
    <tr>
    <td>Cleanup</td>
    <td>In this stage, the litmus repo is removed and cluster gets disconnected.</td>
  </tr>
</table>

# **OpenEBS E2E Pipeline**
It contains the openebs e2e BDDs for OpenEBS experiments. A stateful application (percona) is deployed using cstor (OpenEBS Storage class). The chaos is performed on the different OpenEBS components with the same application.At the end, the application, litmus, and OpenEBS all are uninstalled gracefully.

## **Different Stages:**
<table style="width:100%">
  <tr>
    <th>Stages</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Setup</td>
    <td>This stage is used for connecting to the OnPrem cluster which is a 4 node cluster(1 master and 3 worker) and clone the litmus-e2e folder</td>
  </tr>
  <tr>
    <td>Infra setup</td>
    <td>It contains the three jobs Build Litmus which is used to install Litmus, Build OpenEBS which is used to install openebs, App-deploy It is used to deploy application using openebs.</td>
  </tr>
  <tr>
    <td>Application setup</td>
    <td>In this stage a sample stateful percona application is deployed which will be used to test the openebs experiments</td>
  </tr>
   <tr>
    <td>Experiment</td>
    <td>This stage includes the creation of Chaos Experiments, Engine for the experiments and test cases (BDDs)for the experiments.</td>
  </tr>
    <tr>
    <td>Infra Cleanup</td>
    <td>This stage include the set of jobs which will remove litmus,openebs and deployed application.</td>
  </tr>
  <tr>
    <td>Application cleanup</td>
    <td>In this stage a sample stateful percona application is removed after chaos</td>
  </tr>  
   <tr>
    <td>Cleanup</td>
    <td>In this stage, the litmus-e2e repo is removed and cluster gets disconnected.</td>
  </tr>
</table>

# **Litmus Portal E2E Pipeline**
It contains litmus-portal BDD tests using Cypress. Currently, it contains Cypress E2E tests for functionalities like login, Welcome Modal, User management and Browse Schedules.

## **Different Stages:**
<table style="width:100%">
  <tr>
    <th>Stages</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Setup</td>
    <td>This stage is used for connecting to the OnPrem cluster which is a 4 node cluster(1 master and 3 worker) and clone the litmus-e2e folder.</td>
  </tr>
  <tr>
    <td>Portal-Setup</td>
    <td>This stage is used for deploying the litmus-portal on OnPrem cluster and also verifies if all pods and services are ready or not.</td>
  </tr>
  <tr>
    <td>Test-Setup</td>
    <td>This stage is used for installing Cypress for first time and warming up the cached dependencies of Cypress.</td>
  </tr>
  <tr>
    <td>Pre-Test-Setup</td>
    <td>This stage is used for doing pre-test checkups such as login and welcome-modal functionalities.</td>
  </tr>
  <tr>
    <td>Cypress-Test</td>
    <td>This stage is used for testing different functionalities of litmus-portal such as User-management, Creation of workflows and browsing of workflows,etc</td>
  </tr>
  <tr>
    <td>Portal-Cleanup</td>
    <td>This stage is used for deleting the all resources of litmus-portal from the cluster.</td>
  </tr>
  <tr>
    <td>Cluster Cleanup</td>
    <td>In this stage, the litmus-e2e repo is removed and cluster gets disconnected.</td>
  </tr>
</table>