# LitmusChaos E2E
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus-e2e.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus-e2e?ref=badge_shield)

This repository contains the Gitlab e2e pipeline with BDD tests for Generic experiments of litmus. An auxiliary application is deployed in the scope of different scenarios and the chaos is performed on that application then in the cleanup stage it is removed successfully.

## Branch Details

<table style="width:100%">
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
    <td>It contains the test cases (GO BDDs) for Litmus OpenEBS experiment which includes different OpenEBS control plane and data tests. 
  </tr>
  <tr>
    <td>litmus-portal</td>
    <td>It contains different test cases for litmus portal</td>
  </tr>

## Generic E2E pipeline:

The Generic pipeline covers the test for litmus generic experiments which include some before and after chaos validation and performance checks for different litmus components.

### Different Stages:
<table style="width:100%">
  <tr>
    <th>Stages</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Setup</td>
    <td>In this stage, the gke cluster is set up with the given value of nodes.</td>
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
    <td>This stage includes the creation of experiments,engine and positive and negative test cases for the experiments.</td>
  </tr>
    <tr>
    <td>Component checks</td>
    <td>This stage includes the test to check the performance of litmus components.</td>
  </tr>
  </tr>
    <tr>
    <td></td>
    <td>This stage also includes the creation of experiments,engine and positive and negative test cases of Infra experiments.</td>
  </tr>  
  <tr>
    <td>App-cleanup</td>
    <td>This is the experiment and application cleanup stage on which all the engines, applications, experiments are removed.</td>
  </tr>
    <tr>
    <td>Cleanup</td>
    <td>In this stage, the cluster along with VPC Network gets deleted.</td>
  </tr>
</table>

## How to view the details of the last few pipeline runs?
To view the details of the last few pipeline runs:
- Choose the above directory whose pipeline details you want.
- Inside it contains the jobs details in each folder and pipeline details in README.md. 

# OpenEBS E2E Pipeline
It contains the Gitlab e2e pipeline with BDD and other test cases for OpenEBS experiments. A stateful application (percona) deployed using cstor (OpenEBS Storage class). The chaos is performed on the different OpenEBS components using the same application. In the end, The application, litmus, and OpenEBS are removed successfully.

### Different Stages:
<table style="width:100%">
  <tr>
    <th>Stages</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Cluster Setup</td>
    <td>In this stage, the gke cluster is set up with the given value specifications.</td>
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
    <td>Cluster Cleanup</td>
    <td>In this stage, the cluster is removed successfully</td>
  </tr>
</table>


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus-e2e.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus-e2e?ref=badge_large)

