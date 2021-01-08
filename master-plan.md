## File .master-plan.yml
_.master-plan.yml_ file will contain all the desired test cases for generic experiments. Detailed test cases are derived from this master plan. The test cases will be placed in the repo with enough hints to trace it back to this test case id. It is also used to define or track a manual coverage in the pipeline (as a separate job) which can be used to define the stability of an experiment.

Following is a sample master plan yaml:

```yaml
kind: MasterPlan
metadata:
  name: litmus-e2e-master-testplan
spec:
  tests:
  - tcid: TCID-EC2-GENERIC-APP-POD-DELETE
    name: "TCID-EC2-GENERIC-APP-POD-DELETE"
    description: "Fail the application pod"
    labels:
      test/feature: "Generic-App"
      test/tags: "pod, kill"
      git/location: "https://github.com/litmuschaos/litmus-e2e/tree/master/generic-pipeline/pod-delete"
      test/status: "Done"

  - tcid: TCID-EC2-GENERIC-APP-CONTAINER-KILL
    name: "TCID-EC2-GENERIC-APP-CONTAINER-KILL"
    description: "Kill one container in the application pod"
    labels:
      test/feature: "Generic-App"
      test/tags: "pod, container"
      git/location: "https://github.com/litmuschaos/litmus-e2e/tree/master/generic-pipeline/container-kill"
      test/status: "Not Done"
```

## Important points

- Each test case would be specified in individual GitLab jobs in gitlab-ci.yaml.<br>
- The format of adding `tcid` is `TCID-<PLATFORM>-<TEST-CATEGORY>-<TEST-SCOPE>-<ACTUAL-TEST-NAME>`. <br>

  **PLATFORM:** It is the platform where the e2e tests are running.<br>
  **TEST-CATEGORY:** The category of the test. It can be generic, litmus-portal, openebs, or any other.<br>
  **TEST-SCOPE:** Specify the scope of the test. It can be an app for application-level test or infra for infra level test.<br>
  **ACTUAL-TEST-NAME:** The actual name of the test<br>

  **Example:** TCID-EC2-GENERIC-APP-POD-DELETE

_Following items are added in list format:_

<table>
  <tr>
    <th>Items</th>
    <th>Description</th>
  </tr>
  <tr>
    <th>tcid</th>
    <td>It is a unique test case id written in a specific format defined above</td>
  </tr>
  <tr>
    <th>name</th>
    <td>Name of the test. The should define the actual test logic.</td>
  </tr>
  </tr>
  <tr>
    <th>description</th>
    <td>It should be the details description of the test that is which functionality it will test along with the expectation.</td>
  </tr>
  <tr>
    <th>labels</th>
    <td>The labels are added for its more specification and its location in the repository. The comman labels are:<br>
     <code>test/feature</code>: The name of exact feature it will test.<br>
    <code>test/tags</code>: Some tags related to the test.<br>
    <code>git/location</code>: The location of test <code>README.md</code> which contains the details description of the test along with its everyday status in pipeline. The <code>master</code> branch of this repository mainly contains the test README.<br>
    <code>test/status</code>: These can be used to test if the test has been added in the pipeline (that is in <code>.gitlab-ci.yml</code>) or not. If added the it will update with <code>DONE</code> and if not added it will be <code>NOT DONE</code>.
    </td>
  </tr>
</table>
