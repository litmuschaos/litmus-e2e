# OpenEBS Target Pod Failure

## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> OpenEBS Target Pod Failure </td>
 <td> Kill the cstor/jiva target/controller pod and check if gets created again . This scenario validates the behaviour of application and OpenEBS persistent volumes when chaos is induced on the OpenEBS data plane controller.
 </td>
 <td>  <a href="https://docs.litmuschaos.io/docs/openebs-target-pod-failure/"> Here </a> </td>
 </tr>
 </table>

### Pipeline Runs
 
| Job ID |   Test Description         | Execution Time | Release Tag   | Test Result   |
 |---------|---------------------------| --------------|--------|--------|
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177010">177010</a>   |  OpenEBS Target Pod Failure           |  Wed Jul 15 16:17:29 2020(IST)     |latest  |Passed :smiley:  |
