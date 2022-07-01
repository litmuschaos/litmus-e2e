# End-To-End Tests for Litmus-Portal

**Litmus-Portal Pipeline** provides E2E test cases for Litmus-portal UI, which can be used for

- Testing individual PRs in [Litmus](http://github.com/litmuschaos/litmus)/[Litmus-Helm](https://github.com/litmuschaos/litmus-helm) Repositories
- Manual Tests
- Nightly builds

### Prerequisites And Framework

We use the End to End Testing Framework - [**Cypress**](https://docs.cypress.io/guides/overview/why-cypress) for testing Litmus-Portal.
As Cypress is a npm package, for writing tests developers have to install LTS version of npm before writing tests.

Litmus-Portal is a Cloud-native application that can be configured and managed easily. A developer needs to have a cluster for deploying litmus-Portal. We have used KIND/K3S Clusters to deploy portal in CI as their stable releases are generally recommended for CI usage in particular.

### Setup

- Firstly we need a k8s cluster to deploy the litmus portal, users can use any K8s Cluster. After that, you need to run the following command to install portal:

```
kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/manifests/cluster-k8s-manifest.yml
```

- Clone the [Litmus-e2e]("https://github.com/litmuschaos/litmus-e2e") repository, checkout to your branch and change directory to Cypress -

```
git clone https://github.com/litmuschaos/litmus-e2e.git && cd litmus-e2e
git checkout -b <YOUR_BRANCH_NAME>
cd Cypress
```

- As we use different plugins from Cypress for testing different Scenarios, we have to install all packages. For this Developers can use npm -

```
npm install
```

- Once all packages are installed, setup the frontend server locally for writing new test as you will have to add more unique parameters while adding a new test.

you can follow [here](https://github.com/litmuschaos/litmus/wiki/Litmus-Portal-Development-Guide#to-enable) for setting it up.

```
cypress.json
-----------------
{
    "baseUrl": "http://localhost:3001", => PORTAL_FRONTEND_URL
}
```

- Run the script to get `KUBE_API_SERVER` (K8s API server URL) and `KUBE_API_TOKEN` (K8s API auth token) inside the same folder -

```
sh kube-api-config.sh <CLUSTER_NAME>
```

- Configure the generated URL and token inside `cypress.json`

```
{
  "env" : {
    "KUBE_API_SERVER": "<Generated_URL>",
    "KUBE_API_TOKEN": "<Generated_Token>",
  }
}
```

- Now, we can start Cypress Test Runner using command -

```
npx cypress open
```

Optional:- For running tests related to Datasource & Monitoring, follow instructions for setting up Monitoring Infrastructure from [here](https://github.com/litmuschaos/litmus/tree/master/monitoring#setup-the-monitoring-infrastructure)

- Developers can manually trigger the tests from the Cypress Test Runner by clicking on test names and play around to get started.

Whenever we add a new test, it will be visible in Cypress Test Runner.

### Add a test in Portal-E2E Pipeline

If you're writing a _new test_ , you will have to add it inside the integrations directory.

**Currently, we have 3 categories of tests -**

- **Basic Tests or Pre-Authentication Tests -** Tests to be executed to test login/Onboarding Features.

- **Parallel Test or Post-Authentication Tests -** Tests which are independent and can be executed parallely (Workflow Scheduling/Analytics/Account-Settings, etc).
- **Smoke Tests -** Tests required for a PR to qualify a minimum criteria. It gives us confidence that a new feature won't break other existing features.

If you want use some mock data in your tests, add the same in fixtures directory and import it into your test, so that it will be reusable and scalable.

If you are adding a new category, than create a directory according to test case and add the same as a job in github actions [workflow](https://github.com/litmuschaos/litmus-e2e/actions/workflows/portal-pipeline.yml)

While adding a test for an existing category, just add the test in category according to the test-case scenario. Pipeline will automatically execute the newly added test along with other tests.

A sample PR flow is outlined [here](https://guides.github.com/introduction/flow/). More detailed one is [here](https://gist.github.com/Chaser324/ce0505fbed06b947d962).

### Guidelines for writing Tests -

These are minor guidelines or support points for new contributors -

- While writing new tests, please use data-cy=\* parameters to access different components on UI.
  For e.g.

```
<Button data-cy="ButtonFeature"/>
```

- Try not to test same scenario repeatedly. For e.g. The login feature is already tested in login test, so we should avoid testing it again while writing new test, as all scenarios starts from login only.

- We have added some resuable functions in pages directory according to pages, which can be used for writing new test. Use the provided functions to avoid repetition and also add reusable functions while working on new test cases. It will help others to avoid repetition.

### Sign your work

We use the Developer Certificate of Origin (DCO) as an additional safeguard for the LitmusChaos project. This is a well established and widely used mechanism to assure that contributors have confirmed their right to license their contribution under the project's license. Please add a line to every git commit message:

```
  Signed-off-by: Random J Developer <random@developer.example.org>
```

The email id should match the email id provided in your GitHub profile.

If you set your `user.name` and `user.email` in git config, you can sign your commit automatically with `git commit -s`.

You can also use git [aliases](https://git-scm.com/book/tr/v2/Git-Basics-Git-Aliases) like `git config --global alias.ci 'commit -s'`. Now you can commit with `git ci` and the commit will be signed.
