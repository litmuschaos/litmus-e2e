# Pod Network Loss

## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> Pod Network Loss </td>
 <td> This experiment injects chaos to disrupt network connectivity to kubernetes pods.The application pod should be healthy once chaos is stopped. It causes loss of access to application replica by injecting packet loss using pumba </td>
 <td>  <a href="https://docs.litmuschaos.io/docs/pod-network-loss/"> Here </a> </td>
 </tr>
 </table>

### Pipeline Runs


| Job ID |   Test Description         | Execution Time | Release Tag   | Test Result   |
 |---------|---------------------------| --------------|--------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177133">177133</a>           |  Inject Packet Loss Into Application Pod           | Wed Jul 15 18:35:46 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177057">177057</a>           |  Inject Packet Loss Into Application Pod           | Wed Jul 15 17:08:26 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/176460">176460</a>           |  Inject Packet Loss Into Application Pod           | Wed Jul 15 12:19:45 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/176344">176344</a>           |  Inject Packet Loss Into Application Pod           | Wed Jul 15 11:25:37 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175739">175739</a>           |  Inject Packet Loss Into Application Pod           | Wed Jul 15 03:10:20 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175708">175708</a>           |  Inject Packet Loss Into Application Pod           | Wed Jul 15 02:06:51 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175291">175291</a>           |  Inject Packet Loss Into Application Pod           | Tue Jul 14 22:57:14 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175083">175083</a>           |  Inject Packet Loss Into Application Pod           | Tue Jul 14 20:47:30 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174982">174982</a>           |  Inject Packet Loss Into Application Pod           | Tue Jul 14 18:43:26 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174809">174809</a>           |  Inject Packet Loss Into Application Pod           | Tue Jul 14 17:39:50 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174754">174754</a>           |  Inject Packet Loss Into Application Pod           | Tue Jul 14 16:38:35 2020(IST)  | latest | Passed :smiley: |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174728">174728</a>   |  Inject Packet Loss Into Application Pod           |  Tue Jul 14 15:07:22 2020(IST)     |latest  |Passed :smiley:  |
