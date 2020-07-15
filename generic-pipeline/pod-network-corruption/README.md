# Pod Network Corruption

## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> Pod Network Corruption </td>
 <td> This chaos action Injects packet corruption on the specified container by starting a traffic control (tc) process with netem rules to add egress packet corruption. Corruption is injected via pumba library with command Pumba netem corruption by passing the relevant network interface, packet-corruption-percentage, chaos duration, and regex filter for the container name. </td>
 <td>  <a href="https://docs.litmuschaos.io/docs/pod-network-corruption/"> Here </a> </td>
 </tr>
 </table

### Pipeline Runs


| Job ID |   Test Description         | Execution Time | Release Tag   | Test Result   |
 |---------|---------------------------| --------------|--------|--------|
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/176342">176342</a>           |  Inject Network Packet Corruption Into Application Pod           | Wed Jul 15 11:21:45 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175737">175737</a>           |  Inject Network Packet Corruption Into Application Pod           | Wed Jul 15 03:06:28 2020(IST)  | ci | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175706">175706</a>           |  Inject Network Packet Corruption Into Application Pod           | Wed Jul 15 02:04:50 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/175081">175081</a>           |  Inject Network Packet Corruption Into Application Pod           | Tue Jul 14 20:55:33 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174980">174980</a>           |  Inject Network Packet Corruption Into Application Pod           | Tue Jul 14 18:39:33 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174807">174807</a>           |  Inject Network Packet Corruption Into Application Pod           | Tue Jul 14 17:35:57 2020(IST)  | latest | Passed :smiley: |
|     <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174752">174752</a>           |  Inject Network Packet Corruption Into Application Pod           | Tue Jul 14 16:34:44 2020(IST)  | latest | Passed :smiley: |
 |    <a href= "https://gitlab.mayadata.io/litmuschaos/litmus-e2e/-/jobs/174726">174726</a>   |  Inject Network Packet Corruption Into Application Pod           |  Tue Jul 14 15:03:25 2020(IST)     |latest  |Passed :smiley:  |
