---
title: Generic
layout: template
filename: generic
--- 

# **Generic E2E Pipeline Execution Details**

**Latest Pipeline Status**

[![pipeline status](https://gitlab.mayadata.io/litmuschaos/litmus-e2e/badges/generic/pipeline.svg)](https://gitlab.mayadata.io/litmuschaos/litmus-e2e/commits/generic)


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

- [TCID-VMWx-GENERIC-APP-POD-DELETE](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/pod-delete/README.md)
- [TCID-VMWx-GENERIC-APP-CONTAINER-KILL](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/container-kill/README.md)
- [TCID-VMWx-GENERIC-APP-POD-CPU-HOG](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/pod-cpu-hog/README.md)
- [TCID-VMWx-GENERIC-APP-POD-MEMORY-HOG](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/pod-memory-hog/README.md)
- [TCID-VMWx-GENERIC-APP-POD-NETWORK-CORRUPTION](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/pod-network-corruption/README.md)
- [TCID-VMWx-GENERIC-APP-POD-NETWORK-LATENCY](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/pod-network-latency/README.md)
- [TCID-VMWx-GENERIC-APP-POD-NETWORK-LOSS](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/pod-network-loss/README.md)
- [TCID-VMWx-GENERIC-APP-POD-NETWORK-DUPLICATION](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/pod-network-duplication/README.md)
- [TCID-VMWx-GENERIC-APP-POD-MEMORY-HOG](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/pod-memory-hog/README.md)
- [TCID-VMWx-GENERIC-APP-DISK-FILL](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/disk-fill/README.md)
- [TCID-VMWx-GENERIC-INFRA-NODE-CPU-HOG](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/node-cpu-hog/README.md)
- [TCID-VMWx-GENERIC-INFRA-NODE-MEMORY-HOG](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/node-memory-hog/README.md)
- [TCID-VMWx-GENERIC-INFRA-NODE-DRAIN](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/node-drain/README.md)
- [TCID-VMWx-GENERIC-INFRA-KUBELET-SERVICE-KILL](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/kubelet-service-kill/README.md)
- [TCID-VMWx-GENERIC-INFRA-NODE-TAINT](https://github.com/litmuschaos/litmus-e2e/tree/master/generic-pipeline/node-taint/README.md)

- [TCID-VMWx-GENERIC-EXPERIMENT-EXPERIMENT-IMAGE-NAME](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/experiment-image/README.md)

### **Operator Tests**

- [TCID-VMWx-GENERIC-OPERATOR-RECONCILE-RESILIENCY](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/reconcile-resiliency/README.md)
- [TCID-VMWx-GENERIC-OPERATOR-ADMIN-MODE](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/admin-mode/README.md)

### **Engine Tests**

- [TCID-VMWx-GENERIC-ENGINE-ANNOTATION-CHECK](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/annotation-check/README.md)
- [TCID-VMWx-GENERIC-ENGINE-APP-INFO](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/appinfo/README.md)
- [TCID-VMWx-GENERIC-ENGINE-ENGINE-STATE](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/engine-state/README.md)
- [TCID-VMWx-GENERIC-ENGINE-EXPERIMENT-NAME](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/experiment-404/README.md)
- [TCID-VMWx-GENERIC-ENGINE-JOB-CLEANUP-POLICY](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/job-cleanup-policy/README.md)
- [TCID-VMWx-GENERIC-ENGINE-SERVICE-ACCOUNT](https://github.com/litmuschaos/litmus-e2e/blob/master/generic-pipeline/service-account/README.md)

# **Pipeline Runs**


| Pipeline ID |   Execution Time        | Release Version | Coverage (in %) |
|---------|---------------------------|--------------|--------------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12844">12844</a>           |  Wed Oct  7 21:56:24 2020(IST)           | ci  | [![84%](https://progress-bar.dev/84)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12836">12836</a>           |  Tue Oct  6 22:49:51 2020(IST)           | ci  | [![84%](https://progress-bar.dev/84)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12787">12787</a>           |  Tue Sep 29 15:47:23 2020(IST)           | img  | [![84%](https://progress-bar.dev/84)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12741">12741</a>           |  Mon Sep 21 11:37:57 2020(IST)           | 1.8.1  | [![84%](https://progress-bar.dev/84)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12736">12736</a>           |  Fri Sep 18 17:54:37 2020(IST)           | 1.8.1  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12722">12722</a>           |  Thu Sep 17 17:05:50 2020(IST)           | 1.8.0  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12693">12693</a>           |  Tue Sep 15 22:19:21 2020(IST)           | 1.8.0  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12689">12689</a>           |  Tue Sep 15 19:48:14 2020(IST)           | ci  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12664">12664</a>           |  Mon Sep 14 02:02:44 2020(IST)           | latest  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12582">12582</a>           |  Thu Sep  3 18:18:03 2020(IST)           | v7  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12568">12568</a>           |  Mon Aug 31 23:59:37 2020(IST)           | v3  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12567">12567</a>           |  Mon Aug 31 20:27:37 2020(IST)           | latest  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12550">12550</a>           |  Sun Aug 30 18:17:03 2020(IST)           | ci  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12540">12540</a>           |  Wed Aug 26 18:09:04 2020(IST)           | ci  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12530">12530</a>           |  Tue Aug 25 17:06:04 2020(IST)           | ci  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12507">12507</a>           |  Thu Aug 20 19:29:26 2020(IST)           | ci  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12501">12501</a>           |  Thu Aug 20 15:39:01 2020(IST)           | ci  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12478">12478</a>           |  Sun Aug 16 23:14:16 2020(IST)           | ci  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12477">12477</a>           |  Sun Aug 16 18:15:58 2020(IST)           | latest  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12471">12471</a>           |  Sun Aug 16 01:12:11 2020(IST)           | latest  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12464">12464</a>           |  Sat Aug 15 20:55:40 2020(IST)           | ci  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12385">12385</a>           |  Wed Aug 12 14:59:39 2020(IST)           | ci  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12377">12377</a>           |  Wed Aug 12 12:59:05 2020(IST)           | ci  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12369">12369</a>           |  Wed Aug 12 02:16:11 2020(IST)           | 1.6.2  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12367">12367</a>           |  Tue Aug 11 21:12:38 2020(IST)           | 1.6.2  | [![83%](https://progress-bar.dev/83)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12331">12331</a>           |  Sat Aug  8 21:28:00 2020(IST)           | 1.6.2  | [![67%](https://progress-bar.dev/67)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12293">12293</a>           |  Wed Aug  5 07:16:33 2020(IST)           | 1.6.2  | [![67%](https://progress-bar.dev/67)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12290">12290</a>           |  Wed Aug  5 05:05:40 2020(IST)           | ci  | [![67%](https://progress-bar.dev/67)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12269">12269</a>           |  Tue Aug  4 22:11:43 2020(IST)           | ci  | [![67%](https://progress-bar.dev/67)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12258">12258</a>           |  Tue Aug  4 15:04:57 2020(IST)           | ci  | [![67%](https://progress-bar.dev/67)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12120">12120</a>           |  Mon Jul 27 06:53:52 2020(IST)           | ci  | [![94%](https://progress-bar.dev/94)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/12013">12013</a>           |  Wed Jul 22 02:20:04 2020(IST)           | ci  | [![94%](https://progress-bar.dev/94)](https://bit.ly/2OLie8t)  |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/11990">11990</a>           |  Mon Jul 20 13:46:17 2020(IST)           | ci  | [![94%](https://progress-bar.dev/94)](https://bit.ly/2OLie8t)  |
|    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/11984">11984</a>   |  Mon Jul 20 12:19:23 2020(IST)           |  ci     |  [![94%](https://progress-bar.dev/94)](https://bit.ly/2OLie8t)     |
