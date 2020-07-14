# Node Drain

## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> Node Drain </td>
 <td> This experiment drains the node where application pod is running and verifies if it is scheduled on another available node. </td>
 <td>  <a href="https://docs.litmuschaos.io/docs/node-drain/"> Here </a> </td>
 </tr>
 </table>

 ### Pipeline Runs


| Job ID |   Test Description         | Execution Time | Release Tag   | Test Result   |
 |---------|---------------------------| --------------|--------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174987">174987</a>           |  Drain the node where application pod is scheduled.           | Tue Jul 14 18:52:59 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174813">174813</a>           |  Drain the node where application pod is scheduled.           | Tue Jul 14 17:51:13 2020(IST)  | latest | Awaited :cold_sweat: |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174732">174732</a>   |  Drain the node where application pod is scheduled.           |  Tue Jul 14 15:16:15 2020(IST)     |latest  |Awaited :cold_sweat:  |
