# OpneEBS Pool Pod Failure

## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> OpenEBS Pool Pod Failure </td>
 <td> Kill the pool pod and check if gets scheduled again. This scenario validates the behaviour of application and OpenEBS persistent volumes when chaos is induced on storage pool. The litmus experiment fails the specified pool thereby losing the access to volumes created on it.
 </td>
 <td>  <a href="https://docs.litmuschaos.io/docs/openebs-pool-pod-failure/"> Here </a> </td>
 </tr>
 </table>

### Pipeline Runs
| Job ID |   Test Description         | Execution Time | Release Tag   | Test Result   |
 |---------|---------------------------| --------------|--------|--------|
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177012">177012</a>   |  OpenEBS Pool Pod Failure           |  Wed Jul 15 16:21:33 2020(IST)     |latest  |Failed :worried:  |
