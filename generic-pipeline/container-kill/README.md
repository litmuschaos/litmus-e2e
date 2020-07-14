# Container Kill

## Experiment Metadata
<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> Container Kill </td>
 <td> This experiment executes SIGKILL on container of random replicas of an application deployment. It tests the deployment sanity (replica availability & uninterrupted service) and recovery workflows of an application. </td>
 <td>  <a href="https://docs.litmuschaos.io/docs/container-kill/"> Here </a> </td>
 </tr>
 </table>

 ### Pipeline Runs
 

| Job ID |   Test Description         | Execution Time | Release Tag   | Test Result   |
 |---------|---------------------------| --------------|--------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174977">174977</a>           |  Kill one container in the application pod           | Tue Jul 14 18:34:09 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174804">174804</a>           |  Kill one container in the application pod           | Tue Jul 14 17:30:27 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174749">174749</a>           |  Kill one container in the application pod           | Tue Jul 14 16:29:23 2020(IST)  | latest | Passed :smiley: |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174723">174723</a>   |  Kill one container in the application pod           |  Tue Jul 14 14:57:49 2020(IST)     |latest  |Passed :smiley:  |
