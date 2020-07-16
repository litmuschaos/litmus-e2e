# Pod Network Latency

## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> Pod Network Latency </td>
 <td> This experiment causes flaky access to application replica by injecting network delay using pumba. It injects latency on the specified container by starting a traffic control (tc) process with netem rules to add egress delays. It Can test the application's resilience to lossy/flaky network </td>
 <td>  <a href="https://docs.litmuschaos.io/docs/pod-network-latency/"> Here </a> </td>
 </tr>
 </table>

### Pipeline Runs


| Job ID |   Test Description         | Execution Time | Release Tag   | Test Result   |
 |---------|---------------------------| --------------|--------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177520">177520</a>           |  Inject Network Latency Into Application Pod           | Thu Jul 16 07:01:59 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177282">177282</a>           |  Inject Network Latency Into Application Pod           | Wed Jul 15 19:38:11 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177132">177132</a>           |  Inject Network Latency Into Application Pod           | Wed Jul 15 18:33:54 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177056">177056</a>           |  Inject Network Latency Into Application Pod           | Wed Jul 15 17:06:33 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/176459">176459</a>           |  Inject Network Latency Into Application Pod           | Wed Jul 15 12:17:53 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/176343">176343</a>           |  Inject Network Latency Into Application Pod           | Wed Jul 15 11:23:46 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175738">175738</a>           |  Inject Network Latency Into Application Pod           | Wed Jul 15 03:08:28 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175707">175707</a>           |  Inject Network Latency Into Application Pod           | Wed Jul 15 01:56:26 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175082">175082</a>           |  Inject Network Latency Into Application Pod           | Tue Jul 14 20:57:22 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174981">174981</a>           |  Inject Network Latency Into Application Pod           | Tue Jul 14 18:41:34 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174808">174808</a>           |  Inject Network Latency Into Application Pod           | Tue Jul 14 17:37:59 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174753">174753</a>           |  Inject Network Latency Into Application Pod           | Tue Jul 14 16:36:43 2020(IST)  | latest | Passed :smiley: |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174727">174727</a>   |  Inject Network Latency Into Application Pod           |  Tue Jul 14 15:05:28 2020(IST)     |latest  |Passed :smiley:  |
