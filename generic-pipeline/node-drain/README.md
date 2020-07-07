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

 
| Job ID |   Test Description         | Execution Time |Test Result   |
 |---------|---------------------------| --------------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/168932">168932</a>           |  Drain the node where application pod is scheduled.           | Wed Jul  8 00:23:03 2020  | Pass |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/168520">168520</a>   |  Drain the node where application pod is scheduled.           |  Tue Jul  7 14:28:48 2020     |Pass  |
