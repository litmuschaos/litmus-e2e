---
title: Generic
layout: template
filename: generic
---

# **Generic E2E Pipeline Execution Details**

**Latest Pipeline Status**

[![pipeline status](https://github.com/litmuschaos/litmus-e2e/actions/workflows/scheduled-component-pipeline.yml/badge.svg)](https://github.com/litmuschaos/litmus-e2e/actions/workflows/scheduled-component-pipeline.yml)

[![pipeline status](https://github.com/litmuschaos/litmus-e2e/actions/workflows/scheduled-node-level-pipeline.yml/badge.svg)](https://github.com/litmuschaos/litmus-e2e/actions/workflows/scheduled-node-level-pipeline.yml)

[![pipeline status](https://github.com/litmuschaos/litmus-e2e/actions/workflows/scheduled-pod-level-pipeline.yml/badge.svg)](https://github.com/litmuschaos/litmus-e2e/actions/workflows/scheduled-pod-level-pipeline.yml)

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> Generic Experiment</td>
 <td> It will test all the LitmusChaos experiments which can be used to inject chaos into containerized applications. These tests can be further classified into application level and node level based on their effect.</td>
 <td>  <a href="https://docs.litmuschaos.io/docs/getstarted/"> Here </a> </td>
</tr>
</table>

# **Pipeline Jobs**

### **Experiment Tests**

- [TCID-EC2-GENERIC-APP-POD-DELETE](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/pod-delete/README.md)
- [TCID-EC2-GENERIC-APP-CONTAINER-KILL](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/container-kill/README.md)
- [TCID-EC2-GENERIC-APP-POD-CPU-HOG](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/pod-cpu-hog/README.md)
- [TCID-EC2-GENERIC-APP-POD-MEMORY-HOG](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/pod-memory-hog/README.md)
- [TCID-EC2-GENERIC-APP-POD-NETWORK-CORRUPTION](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/pod-network-corruption/README.md)
- [TCID-EC2-GENERIC-APP-POD-NETWORK-LATENCY](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/pod-network-latency/README.md)
- [TCID-EC2-GENERIC-APP-POD-NETWORK-LOSS](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/pod-network-loss/README.md)
- [TCID-EC2-GENERIC-APP-POD-NETWORK-DUPLICATION](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/pod-network-duplication/README.md)
- [TCID-EC2-GENERIC-APP-POD-MEMORY-HOG](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/pod-memory-hog/README.md)
- [TCID-EC2-GENERIC-APP-DISK-FILL](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/disk-fill/README.md)
- [TCID-EC2-GENERIC-INFRA-NODE-CPU-HOG](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/node-cpu-hog/README.md)
- [TCID-EC2-GENERIC-INFRA-NODE-MEMORY-HOG](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/node-memory-hog/README.md)
- [TCID-EC2-GENERIC-INFRA-NODE-DRAIN](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/node-drain/README.md)
- [TCID-EC2-GENERIC-INFRA-KUBELET-SERVICE-KILL](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/kubelet-service-kill/README.md)
- [TCID-EC2-GENERIC-INFRA-NODE-TAINT](https://github.com/litmuschaos/litmus-e2e/tree/gh-pages/generic-pipeline/node-taint/README.md)

- [TCID-EC2-GENERIC-EXPERIMENT-EXPERIMENT-IMAGE-NAME](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/experiment-image/README.md)

### **Operator Tests**

- [TCID-EC2-GENERIC-OPERATOR-RECONCILE-RESILIENCY](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/reconcile-resiliency/README.md)
- [TCID-EC2-GENERIC-OPERATOR-ADMIN-MODE](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/admin-mode/README.md)

### **Engine Tests**

- [TCID-EC2-GENERIC-ENGINE-ANNOTATION-CHECK](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/annotation-check/README.md)
- [TCID-EC2-GENERIC-ENGINE-APP-INFO](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/appinfo/README.md)
- [TCID-EC2-GENERIC-ENGINE-ENGINE-STATE](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/engine-state/README.md)
- [TCID-EC2-GENERIC-ENGINE-EXPERIMENT-NAME](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/experiment-404/README.md)
- [TCID-EC2-GENERIC-ENGINE-JOB-CLEANUP-POLICY](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/job-cleanup-policy/README.md)
- [TCID-EC2-GENERIC-ENGINE-SERVICE-ACCOUNT](https://github.com/litmuschaos/litmus-e2e/blob/gh-pages/generic-pipeline/service-account/README.md)

## Daily Nightly Builds

<table  cellpadding="5">

  <tr>
      <td>
      <a href="pipeline-runs/pod-level-run.html">
      <img src="../images/pipeline-runs/pod-level-nightly-build.png" alt="pod-level-nightly-build" />
      <br />
      <b>Pod Level Nightly Build</b>
      </a>
      </td>

      <td align="center" valign="center">
      <a href="pipeline-runs/node-level-run.html">
      <img src="../images/pipeline-runs/node-level-nightly-build.png" alt="node-level-nightly-build" />
      <br />
      <b>Node Level Nightly Build</b>
      </a>
      </td>

      <td align="center" valign="center">
      <a href="pipeline-runs/litmus-component-run.html">
      <img src="../images/pipeline-runs/litmus-component-nightly-build.png" alt="litmus-component-nightly-build" />
      <br />
      <b>Component Nightly Build</b>
      </a>
      </td>

  </tr>

</table>

## Release Candidate(RC) Build

<table  cellpadding="5">

  <tr>
      <td>
      <a href="pipeline-runs/pod-level-rc.html">
      <img src="../images/pipeline-runs/pod-level-rc.png" alt="pod-level-rc-build" />
      <br />
      <b>Pod Level RC Build</b>
      </a>
      </td>

      <td align="center" valign="center">
      <a href="pipeline-runs/node-level-rc.html">
      <img src="../images/pipeline-runs/node-level-rc.png" alt="node-level-rc-build" />
      <br />
      <b>Node Level RC Build</b>
      </a>
      </td>

      <td align="center" valign="center">
      <a href="pipeline-runs/litmus-component-rc.html">
      <img src="../images/pipeline-runs/component-rc.png" alt="litmus-component-rc-build" />
      <br />
      <b>Component RC Build</b>
      </a>
      </td>

  </tr>

</table>

## General Availability(GA) Build

<table  cellpadding="5">

  <tr>
      <td>
      <a href="pipeline-runs/pod-level-ga.html">
      <img src="../images/pipeline-runs/pod-level-ga.png" alt="pod-level-ga-build" />
      <br />
      <b>Pod Level GA Build</b>
      </a>
      </td>

      <td align="center" valign="center">
      <a href="pipeline-runs/node-level-ga.html">
      <img src="../images/pipeline-runs/node-level-ga.png" alt="node-level-ga-build" />
      <br />
      <b>Node Level GA Build</b>
      </a>
      </td>

      <td align="center" valign="center">
      <a href="pipeline-runs/litmus-component-ga.html">
      <img src="../images/pipeline-runs/component-ga.png" alt="litmus-component-ga-build" />
      <br />
      <b>Component GA Build</b>
      </a>
      </td>

  </tr>

</table>
