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
 
| Job ID |   Test Description         | Execution Time |Test Result   |
 |---------|---------------------------| --------------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/171884">171884</a>           |  Kill one container in the application pod           | Thu Jul  9 23:48:46 2020  | Pass |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/171848">171848</a>           |  Kill one container in the application pod           | Thu Jul  9 23:16:14 2020  | Pass |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/168925">168925</a>           |  Kill one container in the application pod           | Wed Jul  8 00:07:09 2020  | Pass |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/168513">168513</a>           |  Kill one container in the application pod           | Tue Jul  7 14:14:21 2020  | Pass |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/168469">168469</a>   |  Kill one container in the application pod           |  Tue Jul  7 12:17:14 2020     |Pass  |
