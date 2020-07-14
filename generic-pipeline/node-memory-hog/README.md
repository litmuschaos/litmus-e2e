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


| Job ID |   Test Description         | Execution Time | Release Tag   | Test Result   |
 |---------|---------------------------| --------------|--------|--------|
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174731">174731</a>   |  Exhaust Memory resources on the Kubernetes Node           |  Tue Jul 14 15:15:20 2020(IST)     |latest  |Passed :smiley:  |
