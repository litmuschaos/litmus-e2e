# OpenEBS Control Plane Chaos

## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> OpenEBS control plane chaos </td>
 <td>
  
 - Kill the OpenEBS control plane pods and check if they are rescheduled and healthy	
 - This scenario validates graceful & forced terminations of OpenEBS control plane pods
 - List of control plane components killed in this experiment:
   - maya-apiserver
   - openebs-admission-server
   - openebs-localpv-provisioner
   - openebs-ndm-operator
   - openebs-provisioner
   - openebs-snapshot-operator
   - openebs-ndm
 </td>
 <td><a href="https://docs.litmuschaos.io/docs/openebs-control-plane-chaos">openebs-control-plane-chaos</a> </td>
 </tr>
 </table>

### Pipeline Runs
 

| Job ID |   Test Description         | Execution Time | Release Tag   | Test Result   |
 |---------|---------------------------| --------------|--------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/178407">178407</a>           |  OpenEBS control plane chaos test the control plane component           | Fri Jul 17 03:13:29 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177440">177440</a>           |  OpenEBS control plane chaos test the control plane component           | Thu Jul 16 03:12:32 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177316">177316</a>           |  OpenEBS control plane chaos test the control plane component           | Wed Jul 15 20:50:22 2020(IST)  | latest | Passed :smiley: |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/177016">177016</a>   |  OpenEBS control plane chaos test the control plane component           |  Wed Jul 15 16:14:47 2020(IST)     |latest  |Passed :smiley:  |
