# Node CPU Hog

## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> Node Cpu Hog </td>
 <td> This experiment causes CPU resource exhaustion on the Kubernetes node. The experiment aims to verify resiliency of applications whose replicas may be evicted on account on nodes turning unschedulable (Not Ready) due to lack of CPU resources. </td>
 <td>  <a href="https://docs.litmuschaos.io/docs/node-cpu-hog/"> Here </a> </td>
 </tr>
 </table>

 ### Pipeline Runs

 
| Job ID |   Test Description         | Execution Time |Test Result   |
 |---------|---------------------------| --------------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/171890">171890</a>           |  Exhaust CPU resources on the Kubernetes Node           | Fri Jul 10 00:01:58 2020  | Pass |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/168931">168931</a>           |  Exhaust CPU resources on the Kubernetes Node           | Wed Jul  8 00:20:40 2020  | Pass |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/168519">168519</a>   |  Exhaust CPU resources on the Kubernetes Node           |  Tue Jul  7 14:26:25 2020     |Pass  |
