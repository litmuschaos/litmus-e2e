## litmus-e2e
This repository contains the Gitlab e2e pipeline with BDD and other positive and negative test cases for Generic experiments of litmus. An auxiliary application is deployed in the scope of different scenarios and the chaos is performed on that application then in the cleanup stage it is removed successfully.
# Here are the different stages of the Gitlab pipeline:

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
    <td>Infra-experiment</td>
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