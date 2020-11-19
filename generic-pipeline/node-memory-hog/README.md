# Node Memory Hog

## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
<td> Node Memory Hog </td>
<td> This experiment causes Memory exhaustion on the Kubernetes node. The experiment aims to verify resiliency of applications whose replicas may be evicted on account on nodes turning unschedulable due to lack of Memory resources. </td>
<td>   <a href="https://docs.litmuschaos.io/docs/node-memory-hog/"> Here </a> </td>
</tr> 
</table>

### Pipeline Runs


| Job ID |   Test Description         | Execution Time | Release Tag   | Test Result   |
 |---------|---------------------------| --------------|--------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/232727">232727</a>           |  Exhaust Memory resources on the Kubernetes Node           | Thu Nov 19 14:08:28 2020(IST)  | 1.10.0 | Failed :worried: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/232113">232113</a>           |  Exhaust Memory resources on the Kubernetes Node           | Mon Nov 16 00:57:15 2020(IST)  | 1.10.0 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/232045">232045</a>           |  Exhaust Memory resources on the Kubernetes Node           | Sun Nov 15 20:14:58 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/232010">232010</a>           |  Exhaust Memory resources on the Kubernetes Node           | Sun Nov 15 02:16:26 2020(IST)  | multiarch-1.9.0 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/231976">231976</a>           |  Exhaust Memory resources on the Kubernetes Node           | Sun Nov 15 00:07:08 2020(IST)  | multiarch-1.9.0 | Awaited :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/231853">231853</a>           |  Exhaust Memory resources on the Kubernetes Node           | Sat Nov 14 13:40:11 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/230133">230133</a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Oct 28 22:46:14 2020(IST)  | ci | Failed :worried: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/229013">229013</a>           |  Exhaust Memory resources on the Kubernetes Node           | Mon Oct 19 20:49:39 2020(IST)  | 1.9.0 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/228260">228260</a>           |  Exhaust Memory resources on the Kubernetes Node           | Fri Oct 16 18:00:28 2020(IST)  | 1.9.0 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/227586">227586</a>           |  Exhaust Memory resources on the Kubernetes Node           | Fri Oct 16 00:39:42 2020(IST)  | 1.9.0 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/227503">227503</a>           |  Exhaust Memory resources on the Kubernetes Node           | Thu Oct 15 19:43:12 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/227420">227420</a>           |  Exhaust Memory resources on the Kubernetes Node           | Thu Oct 15 13:55:08 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/227234">227234</a>           |  Exhaust Memory resources on the Kubernetes Node           | Thu Oct 15 03:16:28 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/227199">227199</a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Oct 14 21:36:35 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/223815">223815</a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Oct  7 21:20:17 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/222999">222999</a>           |  Exhaust Memory resources on the Kubernetes Node           | Mon Oct  5 17:04:52 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/220586">220586</a>           |  Exhaust Memory resources on the Kubernetes Node           | Tue Sep 29 15:04:47 2020(IST)  | img | Failed :worried: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/219651">219651</a>           |  Exhaust Memory resources on the Kubernetes Node           | Fri Sep 25 12:58:25 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/218371">218371</a>           |  Exhaust Memory resources on the Kubernetes Node           | Tue Sep 22 00:15:34 2020(IST)  | 1.8.1 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/217938">217938</a>           |  Exhaust Memory resources on the Kubernetes Node           | Mon Sep 21 11:08:30 2020(IST)  | 1.8.1 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Fri Sep 18 17:25:46 2020(IST)  | 1.8.1 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Thu Sep 17 16:43:22 2020(IST)  | 1.8.0 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Tue Sep 15 21:55:41 2020(IST)  | 1.8.0 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Tue Sep 15 19:14:15 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Tue Sep 15 18:03:14 2020(IST)  | v15 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Mon Sep 14 01:25:12 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Mon Sep 14 00:43:18 2020(IST)  | latest | Failed :worried: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Thu Sep  3 17:48:05 2020(IST)  | v7 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Mon Aug 31 23:33:40 2020(IST)  | v3 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Mon Aug 31 20:06:08 2020(IST)  | latest | Awaited :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Sun Aug 30 17:47:58 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Aug 26 17:40:49 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Tue Aug 25 16:37:03 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Thu Aug 20 18:59:51 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Thu Aug 20 14:39:31 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Sun Aug 16 22:17:39 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Sun Aug 16 17:47:52 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Sun Aug 16 00:43:30 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Sat Aug 15 20:27:52 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Aug 12 14:33:04 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Aug 12 12:32:41 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Aug 12 01:22:54 2020(IST)  | 1.6.2 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Tue Aug 11 20:14:12 2020(IST)  | 1.6.2 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Sat Aug  8 20:46:57 2020(IST)  | 1.6.2 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Aug  5 06:31:40 2020(IST)  | 1.6.2 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Aug  5 02:38:40 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Exhaust Memory resources on the Kubernetes Node           | Mon Jul 27 17:30:01 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/183248">183248</a>           |  Exhaust Memory resources on the Kubernetes Node           | Mon Jul 27 06:40:33 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/180700">180700</a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Jul 22 02:06:45 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/180077">180077</a>           |  Exhaust Memory resources on the Kubernetes Node           | Mon Jul 20 21:26:00 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/179585">179585</a>           |  Exhaust Memory resources on the Kubernetes Node           | Mon Jul 20 13:40:26 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/179094">179094</a>           |  Exhaust Memory resources on the Kubernetes Node           | Mon Jul 20 11:28:50 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/178491">178491</a>           |  Exhaust Memory resources on the Kubernetes Node           | Fri Jul 17 07:14:08 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177525">177525</a>           |  Exhaust Memory resources on the Kubernetes Node           | Thu Jul 16 07:13:47 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177287">177287</a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Jul 15 19:49:58 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177137">177137</a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Jul 15 18:45:31 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177061">177061</a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Jul 15 17:18:09 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/176464">176464</a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Jul 15 12:29:28 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/176348">176348</a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Jul 15 11:35:35 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175743">175743</a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Jul 15 03:20:01 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175712">175712</a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Jul 15 02:16:25 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175087">175087</a>           |  Exhaust Memory resources on the Kubernetes Node           | Tue Jul 14 21:05:13 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174986">174986</a>           |  Exhaust Memory resources on the Kubernetes Node           | Tue Jul 14 18:51:06 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174812">174812</a>           |  Exhaust Memory resources on the Kubernetes Node           | Tue Jul 14 17:50:20 2020(IST)  | latest | Passed :smiley: |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174731">174731</a>   |  Exhaust Memory resources on the Kubernetes Node           |  Tue Jul 14 15:15:20 2020(IST)     |latest  |Passed :smiley:  |
