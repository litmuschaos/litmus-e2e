# litmus-e2e
This repository contains the Gitlab e2e pipeline with BDD tests for Generic experiments of litmus. An auxiliary application is deployed in the scope of different scenarios and the chaos is performed on that application then in the cleanup stage it is removed successfully.
## Here are the different stages of the Gitlab pipeline:

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

### Validations for OpenEBS Experiments (To be done)
<table style="width:100%">
  <tr>
    <th rowspan="2"><h3>Experiments</h3></th>
    <th colspan="2"><h3>Validations (Test Cases)</h3></th>
  </tr>
  <tr>
    <th><h3>Before Chaos</h3></th>
    <th><h3>After Chaos</h3></th>
  </tr>
  <tr>
    <td><b>Openebs Pool Container Failure<b></td>
<td>
1. <b>Resource Version</b> changes (from old)<br><br>
2. <b>Restart count</b> of cstor-pool-mgmt and cstor-pool containers.(from old)<br><br>
3. <b>Container ID</b> changes (from old value)
</td>
<td>
1. <b>Resource Version</b> changes (to new value)<br><br>
2. <b>Restart count</b> of cstor-pool-mgmt and cstor-pool containers.(to new value)<br><br>
3. <b>Container ID</b> changes (to new value)
</td>
</tr>
  <tr>
    <td><b>Openebs Pool Pod Failure</b></td>
    <td>1. <b>New</b> cstor-sparse-pool <b>pod</b> is created in openebs ns - and deleting the old one.<br>
New pod can be tested by checking:-<br><i>
  - Resource Version(old)<br>
  - Name<br>
  - podIP<br>
  - startTime</i><br>
</td>
<td>1. The <b>old</b> cstor-sparse-pool <b>pod</b>
Gets deleted and <b>new one</b> gets created with:-<i><br>
  - Resource Version
         (new)<br>
  - Name(different)<br>
  - podIP(different)<br>
  - startTime(different)</i><br>
</td>
</tr>
  <tr>
    <td><b>Openebs Target Container Failure</b></td>
    <td>
1. <b>Resource Version</b> is changed (from a random number).<br><br> 
2. <b>RestartCount</b> for cstor-istgt container changes (from 0).<br><br>
3. <b>ContainerID</b> changed (status.containerStatuses[0].containerID).<br><br>
4. In container cstor-istgt the value of <b>startedAt</b> changed from (random value).<br><br>
5. <b>lastState</b> contains empty value for cstor-istgt container
</td>
<td>
1. <b>Resource Version</b> changed (to a random number).<br><br>
2. <b>ContainerID</b> changed to new value.<br><br>
3. <b>RestartCount</b> for cstor-istgt container changes (to 1).<br><br>
4. In container cstor-istgt the value of <b>startedAt</b> changed from (random higher value)<br><br>
5. <b>lastState</b> now contains value like containerID,exitCode,reason,finishedAt
</td>
</tr>
<tr>
<td><b>Openebs Target Network Delay</b></td>
<td>
<b>kube-ip tables</b> are used to check network issues.</b>
</td>
<td>It will give an <b>error message</b> if it finds any network issues.
</td>
</tr>
<tr>
<td><b>Openebs Target Network Loss</b></td>
<td>
<b>kube-ip tables</b> are used to check network issues.</b>
</td>
<td>It will give an <b>error message</b> if it finds any network issues.
</td>
</tr>
<tr>
<td><b>Openebs Target Pod Failure</b></td>
<td>
1. <b>Restart count</b> changes for target pod (some value)<br><br>
2. <b>Resource Version</b> of the target pod changes (random value)<br><br>
3. <b>PodIP</b> gets changed (say 10.32.1.12)<br><br>
4. <b>Container ID</b> for cstor-volume-mgmt (from some value)<br><br>
5. <b>lastState</b> contains empty value for cstor-volume-mgmt container<br><br>
</td>
<td>
1. <b>Restart count</b> changes for target pod ( some value + 1)<br><br>
2. <b>Resource Version</b> of the target pod changes(other random value)<br><br>
3. <b>PodIP</b> gets changed (It will become 10.32.1.13)<br><br>
4. <b>Container Id</b> for cstor-volume-mgmt (to new value)<br><br>
5. <b>lastState</b> contains non empty value for cstor-volume-mgmt container<br><br>
</td>
</tr>
</table>
