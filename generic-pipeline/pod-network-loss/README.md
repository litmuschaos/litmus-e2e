# Pod Network Loss

## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> Pod Network Loss </td>
 <td> This experiment injects chaos to disrupt network connectivity to kubernetes pods.The application pod should be healthy once chaos is stopped. It causes loss of access to application replica by injecting packet loss using pumba </td>
 <td>  <a href="https://docs.litmuschaos.io/docs/pod-network-loss/"> Here </a> </td>
 </tr>
 </table>

 ### Pipeline Runs

 
| Job ID |   Test Description         | Execution Time |Test Result   |
 |---------|---------------------------| --------------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/171850">171850</a>           |  Inject Packet Loss Into Application Pod           | Thu Jul  9 23:20:53 2020  | Pass |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/168927">168927</a>           |  Inject Packet Loss Into Application Pod           | Wed Jul  8 00:12:21 2020  | Pass |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/168515">168515</a>   |  Inject Packet Loss Into Application Pod           |  Tue Jul  7 14:19:43 2020     |Pass  |
