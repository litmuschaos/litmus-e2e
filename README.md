# Litmus-OpenEBS E2E 
This repository contains the Gitlab e2e pipeline with BDD and other test cases for OpenEBS experiments. A stateful application (percona) deployed using cstor (OpenEBS Storage class). The chaos is performed on the different OpenEBS components using the same application. In the end, The application, litmus, and OpenEBS are removed successfully.
## Here are the different stages of the Gitlab pipeline:

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
    <td>Experiment</td>
    <td>This stage includes the creation of Chaos Experiments, Engine for the experiments and test cases (BDDs)for the experiments.</td>
  </tr>
    <tr>
    <td>Infra Cleanup</td>
    <td>This stage include the set of jobs which will remove litmus,openebs and deployed application.</td>
  </tr>
   <tr>
    <td>Cluster Cleanup</td>
    <td>In this stage, the cluster is removed successfully</td>
  </tr>
</table>
