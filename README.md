## litmus-portal-e2e

This branch contains Gitlab e2e pipeline for litmus-portal with BDD tests using Cypress.

# Here are the different stages of the Gitlab pipeline:

<table>
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