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


| Job ID |   Test Description         | Execution Time |Test Result   |
 |---------|---------------------------| --------------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/171894">171894</a>           |  Kills the kubelet service on the application node.           | Fri Jul 10 00:14:50 2020  | Pass |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/168935">168935</a>   |  Kills the kubelet service on the application node.           |  Wed Jul  8 00:33:40 2020     |Pass  |
