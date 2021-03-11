# Kubelet Service Kill

## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> Kubelet Service Kill </td>
 <td> This experiment causes kubelet service kill gracefully for a certain chaos duration. The experiment aims to verify resiliency of applications whose replicas may be evicted or becomes unreachable on account on nodes turning unschedulable (Not Ready) due to kubelet service kill. </td>
 <td>  <a href=""> Added soon </a> </td>
 </tr>
 </table>

### Pipeline Runs


| Job ID |   Test Description         | Execution Time | Release Tag   | Test Result   |
 |---------|---------------------------| --------------|--------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/247738">247738</a>           |  Kills the kubelet service on the application node           | Thu Mar 11 06:13:24 2021(IST)  | ci | Failed :worried: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/241216">241216</a>           |  Kills the kubelet service on the application node           | Mon Jan 11 18:05:15 2021(IST)  | ci | N/A :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/240940">240940</a>           |  Kills the kubelet service on the application node           | Sat Jan  9 17:59:17 2021(IST)  | ci | N/A :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/240745">240745</a>           |  Kills the kubelet service on the application node           | Fri Jan  8 18:00:15 2021(IST)  | ci | N/A :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/240312">240312</a>           |  Kills the kubelet service on the application node           | Tue Jan  5 14:17:33 2021(IST)  | 1.11.2 | Awaited :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/240281">240281</a>           |  Kills the kubelet service on the application node           | Tue Jan  5 13:02:06 2021(IST)  | 1.11.2 | Failed :worried: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/239822">239822</a>           |  Kills the kubelet service on the application node           | Sun Jan  3 17:53:48 2021(IST)  | ci | N/A :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/239694">239694</a>           |  Kills the kubelet service on the application node           | Sat Jan  2 17:36:28 2021(IST)  | ci | N/A :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/239170">239170</a>           |  Kills the kubelet service on the application node           | Wed Dec 30 17:53:49 2020(IST)  | ci | N/A :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/238784">238784</a>           |  Kills the kubelet service on the application node           | Mon Dec 28 18:00:58 2020(IST)  | ci | N/A :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/238657">238657</a>           |  Kills the kubelet service on the application node           | Sun Dec 27 18:10:39 2020(IST)  | ci | N/A :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/238530">238530</a>           |  Kills the kubelet service on the application node           | Sat Dec 26 18:08:55 2020(IST)  | ci | N/A :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/238403">238403</a>           |  Kills the kubelet service on the application node           | Fri Dec 25 18:09:13 2020(IST)  | ci | N/A :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/238276">238276</a>           |  Kills the kubelet service on the application node           | Thu Dec 24 17:59:10 2020(IST)  | ci | N/A :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/237322">237322</a>           |  Kills the kubelet service on the application node           | Thu Dec 17 20:03:37 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/233095">233095</a>           |  Kills the kubelet service on the application node           | Mon Nov 23 20:21:53 2020(IST)  | 1.10.0 | N/A :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/232729">232729</a>           |  Kills the kubelet service on the application node           | Thu Nov 19 14:15:45 2020(IST)  | 1.10.0 | N/A :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/232115">232115</a>           |  Kills the kubelet service on the application node           | Mon Nov 16 01:05:24 2020(IST)  | 1.10.0 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/232047">232047</a>           |  Kills the kubelet service on the application node           | Sun Nov 15 20:21:56 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/232006">232006</a>           |  Kills the kubelet service on the application node           | Sun Nov 15 02:02:40 2020(IST)  | multiarch-1.9.0 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/231978">231978</a>           |  Kills the kubelet service on the application node           | Sun Nov 15 00:13:59 2020(IST)  | multiarch-1.9.0 | Awaited :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/231855">231855</a>           |  Kills the kubelet service on the application node           | Sat Nov 14 13:46:45 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/229015">229015</a>           |  Kills the kubelet service on the application node           | Mon Oct 19 20:55:43 2020(IST)  | 1.9.0 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/228262">228262</a>           |  Kills the kubelet service on the application node           | Fri Oct 16 18:06:44 2020(IST)  | 1.9.0 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/227588">227588</a>           |  Kills the kubelet service on the application node           | Fri Oct 16 00:45:56 2020(IST)  | 1.9.0 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/227505">227505</a>           |  Kills the kubelet service on the application node           | Thu Oct 15 19:49:29 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/227422">227422</a>           |  Kills the kubelet service on the application node           | Thu Oct 15 14:01:21 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/227201">227201</a>           |  Kills the kubelet service on the application node           | Wed Oct 14 21:43:24 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/223817">223817</a>           |  Kills the kubelet service on the application node           | Wed Oct  7 21:23:46 2020(IST)  | ci | Awaited :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/222995">222995</a>           |  Kills the kubelet service on the application node           | Mon Oct  5 16:52:22 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/220588">220588</a>           |  Kills the kubelet service on the application node           | Tue Sep 29 15:11:04 2020(IST)  | img | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/219653">219653</a>           |  Kills the kubelet service on the application node           | Fri Sep 25 13:04:27 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/218373">218373</a>           |  Kills the kubelet service on the application node           | Tue Sep 22 00:21:56 2020(IST)  | 1.8.1 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/217940">217940</a>           |  Kills the kubelet service on the application node           | Mon Sep 21 11:12:19 2020(IST)  | 1.8.1 | Awaited :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Fri Sep 18 17:30:38 2020(IST)  | 1.8.1 | Awaited :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Thu Sep 17 16:48:05 2020(IST)  | 1.8.0 | Awaited :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Tue Sep 15 22:01:06 2020(IST)  | 1.8.0 | Awaited :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Tue Sep 15 19:20:43 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Tue Sep 15 18:12:36 2020(IST)  | v15 | Failed :worried: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Mon Sep 14 01:32:45 2020(IST)  | latest | Failed :worried: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Thu Sep  3 17:54:33 2020(IST)  | v7 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Mon Aug 31 23:37:28 2020(IST)  | v3 | Awaited :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Mon Aug 31 20:09:57 2020(IST)  | latest | Awaited :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Sun Aug 30 17:54:32 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Wed Aug 26 17:46:24 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Tue Aug 25 16:43:23 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Thu Aug 20 19:05:26 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Thu Aug 20 14:45:45 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Sun Aug 16 22:23:10 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Sun Aug 16 17:53:29 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Sun Aug 16 00:49:40 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Sat Aug 15 20:33:39 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Wed Aug 12 14:37:21 2020(IST)  | ci | Awaited :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Wed Aug 12 12:38:05 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Wed Aug 12 01:26:40 2020(IST)  | 1.6.2 | Awaited :cold_sweat: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Tue Aug 11 20:19:06 2020(IST)  | 1.6.2 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Sat Aug  8 20:52:01 2020(IST)  | 1.6.2 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Wed Aug  5 06:36:50 2020(IST)  | 1.6.2 | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Wed Aug  5 02:43:52 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/"></a>           |  Kills the kubelet service on the application node           | Sat Aug  1 01:53:21 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/180702">180702</a>           |  Kills the kubelet service on the application node.           | Wed Jul 22 02:11:20 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/180079">180079</a>           |  Kills the kubelet service on the application node.           | Mon Jul 20 21:39:46 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/179582">179582</a>           |  Kills the kubelet service on the application node.           | Mon Jul 20 13:33:40 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/179096">179096</a>           |  Kills the kubelet service on the application node.           | Mon Jul 20 11:33:31 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/178493">178493</a>           |  Kills the kubelet service on the application node.           | Fri Jul 17 07:18:50 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177527">177527</a>           |  Kills the kubelet service on the application node.           | Thu Jul 16 07:18:19 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177289">177289</a>           |  Kills the kubelet service on the application node.           | Wed Jul 15 19:54:33 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177139">177139</a>           |  Kills the kubelet service on the application node.           | Wed Jul 15 18:50:16 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177063">177063</a>           |  Kills the kubelet service on the application node.           | Wed Jul 15 17:22:41 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/176466">176466</a>           |  Kills the kubelet service on the application node.           | Wed Jul 15 12:34:13 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/176350">176350</a>           |  Kills the kubelet service on the application node.           | Wed Jul 15 11:41:08 2020(IST)  | ci | Failed :worried: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175745">175745</a>           |  Kills the kubelet service on the application node.           | Wed Jul 15 03:24:32 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175714">175714</a>           |  Kills the kubelet service on the application node.           | Wed Jul 15 02:20:48 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175089">175089</a>           |  Kills the kubelet service on the application node.           | Tue Jul 14 21:09:45 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174988">174988</a>           |  Kills the kubelet service on the application node.           | Tue Jul 14 18:55:43 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174814">174814</a>           |  Kills the kubelet service on the application node.           | Tue Jul 14 17:42:40 2020(IST)  | latest | Passed :smiley: |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174733">174733</a>   |  Kills the kubelet service on the application node.           |  Tue Jul 14 15:19:11 2020(IST)     |latest  |Passed :smiley:  |
