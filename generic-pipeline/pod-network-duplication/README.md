# Pod Network Duplication

## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> Pod Network Duplication </td>
 <td> This experiment causes network duplication using pumba. It injects network duplication on the specified container by starting a traffic control (tc) process with netem rules. It Can test the application's resilience to duplicate network </td>
 <td>  <a href="https://docs.litmuschaos.io/docs/pod-network-duplication/"> Here </a> </td>
 </tr>
 </table>

### Pipeline Runs


| Job ID |   Test Description         | Execution Time | Release Tag   | Test Result   |
 |---------|---------------------------| --------------|--------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175709">175709</a>           |  Injects chaos to disrupt network connectivity of pod           | Wed Jul 15 02:08:45 2020(IST)  |  | Passed :smiley: |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175292">175292</a>   |  Injects chaos to disrupt network connectivity of pod           |  Tue Jul 14 22:59:50 2020(IST)     |  |Passed :smiley:  |
