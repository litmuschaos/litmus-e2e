# GUI Test Cases For Workflows Scheduling Operations

<b>tcid:</b> GUI-WorkflowsOps <br>
<b>name:</b> Workflows Scheduling Test Cases Using Browser<br>

### Prerequisites

     • Litmus-Portal should be installed on Cluster.
     • Cypress should be installed and running on Runner-Machine.

### Test Case 1:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify the accessibility of create-workflow page.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Open Litmus-Portal URL in Browser
- Once the UI is accessible, Visit the create-workflow route & verify the page.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Users should be able to access the create-workflow route.

### Test Case 2:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to schedule a predefined workflow (First time user experience).
    [Can be extended to schedule all predefined workflows]

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on create-workflow route)
- Select a predefined workflow from default chaoshub & proceed.
- Verify the workflow details on workflows settings page.
- verify the dagre graph & experiments in the experiments table & proceed.
- assign weights to experiments.
- Verify the details on verify & commit screen & schedule the workflow.
- Validate the workflow details in workflows tab & schedules tab.
- Verify the workflow steps in dagre graph while running.
- Wait for completion of workflow & Check the final status & resiliency score.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Users should be able to schedule predefined workflows & workflows should pass & have correct RR score.

### Test Case 3:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to schedule a workflow from chaoshub & tune the workflow configuration with non-existing target-application.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on create-workflow route/ Or switch to create-workflow route)
- Select default chaoshub from options for selecting chaoshub.
- Verify the workflow details on workflows settings page.
- verify the dagre graph & experiments in the experiments table & proceed.
- Add one experiment from experiments modal & configure the experiment to target a non-existing application by using experiment configuration wizard.
- Verify the experiment in dagre graph.
- Assign weights to experiments.
- Verify the details on verify & commit screen & schedule the workflow.
- Validate the workflow details in workflows tab & schedules tab.
- Verify the workflow steps in dagre graph while running.
- Wait for completion of workflow & Check the final status & resiliency score.

#### &nbsp;&nbsp;&nbsp;Expected Output

    As the Target Application does not exists,
    - the workflow should fail
    - RR score should be zero
    - experiment should have failed

### Test Case 4:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to schedule a workflow from chaoshub & tune the workflow configuration with an existing target-application.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on create-workflow route/ Or switch to create-workflow route)
- Select default chaoshub from options for selecting chaoshub.
- Verify the workflow details on workflows settings page.
- verify the dagre graph & experiments in the experiments table & proceed.
- Add one experiment from experiments modal & configure the experiment to target an existing application.
  (A sample nginx application should be created the test to target the same)
- Verify the experiment in dagre graph.
- Assign weights to experiments.
- Verify the details on verify & commit screen & schedule the workflow.
- Validate the workflow details in workflows tab & schedules tab.
- Verify the workflow steps in dagre graph while running.
- Wait for completion of workflow & Check the final status & resiliency score.

#### &nbsp;&nbsp;&nbsp;Expected Output

    As the Target Application exists,
    - The workflow should pass
    - RR score should be 100
    - experiment should pass

### Test Case 5:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to schedule a workflow by uploading a workflow manifest.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on create-workflow route/ Or switch to create-workflow route)
- Upload a workflow manifest.
- Verify the workflow details on workflows settings page.
- verify the dagre graph & experiments in the experiments table & proceed.
- Add one experiment from experiments modal & configure the experiment to target an existing application.
  (A sample nginx application should be created the test to target the same)
- Verify the experiment in dagre graph.
- Assign weights to experiments.
- Verify the details on verify & commit screen & schedule the workflow.
- Validate the workflow details in workflows tab & schedules tab.
- Verify the workflow steps in dagre graph while running.
- Wait for completion of workflow & Check the final status & resiliency score.

#### &nbsp;&nbsp;&nbsp;Expected Output

    As the Target Application exists,
    - The workflow should pass
    - RR score should be 100
    - experiment should pass

### Test Case 6:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to schedule a workflow by uploading a wrong manifest or incorrect manifests.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on create-workflow route/ Or switch to create-workflow route)
- Upload a wrong workflow manifest.
- manifest having errors in terms of structure.
- manifest having error inside experiment structure.
- manifest having error inside engine structure.
- manifest having no experiments
- After successful upload, the upload container should show error & scheduling should not be allowed (On clicking Next Button, alert should be shown).

#### &nbsp;&nbsp;&nbsp;Expected Output

Users should not be allowed to schedule a workflow using malfunctioned manifests.

### Test Case 7:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to schedule a workflow on a recurring basis.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on create-workflow route/ Or switch to create-workflow route)
- Select default chaoshub from options for selecting chaoshub.
- Verify the workflow details on workflows settings page.
- verify the dagre graph & experiments in the experiments table & proceed.
- Add one experiment from experiments modal & configure the experiment to target an existing application.
  (A sample nginx application should be created before the test to target the same)
- Verify the experiment in dagre graph.
- Assign weights to experiments.
- Select the scheduling option.
  (Time can be given as 2 mins or more from current time for testing)
- Verify the details on verify & commit screen & schedule the workflow by selecting Recurring schedule option.
- Validate the workflow details in workflows tab & schedules tab.
- Verify the workflow steps in dagre graph while running.
- Wait for completion of workflow & Check the final status & resiliency score.

#### &nbsp;&nbsp;&nbsp;Expected Output

Users should be able to schedule a recurring workflow.
