# Node Taint

## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
<td> Node Taint </td>
<td> This experiment taint the node where application pod is running and verifies if it is scheduled on another available node. </td>
<td>   <a href="https://docs.litmuschaos.io/docs/node-taint/"> Here </a> </td>
</tr> 
</table>

### Pipeline Runs


| Job ID |   Test Description         | Execution Time | Release Tag   | Test Result   |
 |---------|---------------------------| --------------|--------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177140">177140</a>           |  Inject Node Taint Into Application Node           | Wed Jul 15 18:52:13 2020(IST)  | ci | Passed :smiley: |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177064">177064</a>   |  Inject Node Taint Into Application Node           |  Wed Jul 15 17:24:31 2020(IST)     |latest  |Passed :smiley:  |
