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


| Job ID |   Test Description         | Execution Time |Test Result   |
 |---------|---------------------------| --------------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/171893">171893</a>           |  Exhaust Memory resources on the Kubernetes Node           | Fri Jul 10 00:11:10 2020  | Pass |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/168934">168934</a>           |  Exhaust Memory resources on the Kubernetes Node           | Wed Jul  8 00:30:02 2020  | Pass |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/168522">168522</a>   |  Exhaust Memory resources on the Kubernetes Node           |  Tue Jul  7 14:35:30 2020     |Pass  |
