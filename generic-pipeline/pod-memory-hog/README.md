# Pod Memory Hog

## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> Pod Memory Hog </td>
 <td> This experiment causes Memory resource consumption on specified application containers by using dd command which will used to consume memory of the application container for certain duration of time. It can test the application's resilience to potential slowness/unavailability of some replicas due to high Memory load.</td>
 <td>  <a href="https://docs.litmuschaos.io/docs/pod-memory-hog/"> Here </a> </td>
 </tr>
 </table>

 ### Pipeline Runs

 
| Job ID |   Test Description         | Execution Time |Test Result   |
 |---------|---------------------------| --------------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/168518">168518</a>           |  Consume memory resources on the application container           | Tue Jul  7 14:24:12 2020  | Pass |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/168479">168479</a>           |  Consume memory resources on the application container           | Tue Jul  7 12:27:28 2020  | Pass |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/168474">168474</a>   |  Consume memory resources on the application container           |  Tue Jul  7 12:21:44 2020     |Pass  |
