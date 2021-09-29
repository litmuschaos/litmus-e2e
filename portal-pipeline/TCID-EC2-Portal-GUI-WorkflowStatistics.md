# GUI Test Cases For Workflows Statistics

<b>tcid:</b> GUI-WorkflowsStatistics <br>
<b>name:</b> Workflows Scheduling Test Cases Using Browser<br>

### Prerequisites

     • Litmus-Portal should be installed on Cluster.
     • Cypress should be installed and running on Runner-Machine.

### Test Case 1:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify the accessibility of workflow statistics Tab.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Open Litmus-Portal URL in Browser
- Once the UI is accessible, Visit the observability route & verify the workflow statistics Tab.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Users should be able to access the workflow statistics Tab.

### Test Case 2:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to schedule a Custom Chaos workflow (Non-Recurring) & verify the workflow statistics data [positive case --> Existing target App]

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Schedule a workflow using API or UI.
- Goto the observability route & check the recent workflows container.
- Verify the workflow is running in the Overview tab.
- Once the workflow is completed, Click on see statistics tab.
- Verify follow details -
  - Workflow details in the "Information and statistics" container.
  - Verify the workflow RR score/ Experiment Statistics & Pass/Fail Percentage by clicking on "show statistics".
  - Verify the experiment details in the experiments table.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Details should be shown below
    - Workflow should be passed.
    - All workflow details should be as given at the time of scheduling.
    - RR score should be 100 as the app exists
    - Pass percentage should be 100 & the Fail percentage should be zero.
    - Experiments details should be verified as we already know experiment details.

### Test Case 3:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to schedule a Custom Chaos workflow (Non-Recurring) & verify the workflow statistics data [negative case --> Non-Existing target App]

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Schedule a workflow using API or UI.
- Goto the observability route & check the recent workflows container.
- Verify the workflow is running in the Overview tab.
- Once the workflow is completed, Click on see statistics tab.
- Verify follow details -
  - Workflow details in the "Information and statistics" container.
  - Verify the workflow RR score/ Experiment Statistics & Pass/Fail Percentage by clicking on "show statistics".
  - Verify the experiment details in the experiments table.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Details should be shown below
    - Workflow should be failed.
    - All workflow details should be as given at the time of scheduling.
    - RR score should be 0 as the app doesn't exist
    - Pass percentage should be 0 & the Fail percentage should be 100.
    - Experiments details should be verified as we already know experiment details.

### Test Case 4:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to schedule a Custom Chaos workflow (Recurring) & verify the workflow statistics data [positive case --> Existing target App]

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Schedule a workflow using API or UI.
- Goto the observability route & check the recent workflows container.
- Verify the workflow is running in the Overview tab.
- Once the workflow is completed, Click on see statistics tab.
- Verify follow details -
  - Workflow details in the "Information and statistics" container.
  - Verify the workflow RR score/ Experiment Statistics & Pass/Fail Percentage by clicking on "show statistics".
  - Heatmap will be available showing workflow run on correct bin in heatmap.
  - Click on a bin for workflow run, a stackbar graph should be shown.
  - Clicking on a bar, will open the experiment table for the paticular workflow run.
  - Verify the experiment details in the experiments table.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Details should be shown below
    - Workflow should be passed.
    - All workflow details should be as given at the time of scheduling. (Recurring)
    - RR score should be 100.
    - Pass percentage should be 100 & the Fail percentage should be 0.
    - Heatmap should be available showing workflow run on correct bin in heatmap.
    - stackbar graph should be visible showing workflow runs on the particular day.
    - On clicking on a bar, Experiment table should be shown.
    - Experiments details should be verified as we already know experiment details.

### Test Case 5:

#### &nbsp;&nbsp;&nbsp;Details

    Rerun a non-recurring workflow & verify the statistics.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Rerun a non-recurring workflow.
- Goto the observability route & check the recent workflows container.
- Verify the workflow is running in the Overview tab.
- Once the workflow is completed, Click on see statistics tab.
- Verify follow details -
  - Workflow details in the "Information and statistics" container.
    [ Workflow should be converted to recurring workflow]
  - Verify the workflow RR score/ Experiment Statistics & Pass/Fail Percentage by clicking on "show statistics".
  - Verify the experiment details in the experiments table.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Details should be shown below
    - Workflow should be passed.
    - All workflow details should be as given at the time of scheduling. (Recurring)
    - RR score should be 100.
    - Pass percentage should be 100 & the Fail percentage should be 0.
    - Heatmap should be available showing workflow run on correct bin in heatmap.
    - On clicking on a bin, stackbar should be visible showing workflow runs on the particular day.
    - On clicking on a bar, Experiment table should be shown.
    - Experiments details should be verified as we already know experiment details.

### Test Case 6:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify the details in the workflow statistics tab.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Goto the observability route & check the recent workflows container.
- Verify following details -
  - Verify the number of workflow run stats (no. of passed/failed/running/total workflow runs).
  - Verify the data in the schedule/Runs stats graph.

#### &nbsp;&nbsp;&nbsp;Expected Output

    All the stats should be as expected.
