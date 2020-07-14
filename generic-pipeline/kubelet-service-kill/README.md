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


| Job ID |   Test Description         | Execution Time | Release Tag   | Test Result   |
 |---------|---------------------------| --------------|--------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174988">174988</a>           |  Kills the kubelet service on the application node.           | Tue Jul 14 18:55:43 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174814">174814</a>           |  Kills the kubelet service on the application node.           | Tue Jul 14 17:42:40 2020(IST)  | latest | Passed :smiley: |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174733">174733</a>   |  Kills the kubelet service on the application node.           |  Tue Jul 14 15:19:11 2020(IST)     |latest  |Passed :smiley:  |
