# API Tests for Litmus

**Portal API Pipeline** provides test cases for Litmus API, which can be used for

- Testing individual PRs in [Litmus](http://github.com/litmuschaos/litmus)/[Litmus-Helm](https://github.com/litmuschaos/litmus-helm) Repositories
- Manual Tests
- Nightly builds

### Prerequisites And Framework

We use the End to End Testing Framework - [**Cypress**](https://docs.cypress.io/guides/overview/why-cypress) for testing Litmus API.
As Cypress is a npm package, for writing tests developers have to install LTS version of npm before writing tests.

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

- Once all packages are installed, check if all the pods are running.

```
watch kubectl get pods -n litmus
```

- After all the pods come in **Running** state, port forward the pods by running each of the below commands in a different terminal. 
```
kubectl port-forward svc/litmusportal-auth-server-service 3000:9003 -n litmus 
kubectl port-forward svc/litmusportal-server-service 9002:9002 -n litmus
kubectl port-forward svc/litmusportal-frontend-service 3001:9091 -n litmus
kubectl port-forward svc/mongo-service 27017:27017 -n litmus
```

- Now, we can start Cypress Test Runner using command -

```
npx cypress open --config-file cypress.prod.json
```

Optional:- For running tests related to GitOps, [create a GitHub Personal Access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) and add that in `githubToken` field in `cypress.prod.json`.

- Developers can manually trigger the tests from the Cypress Test Runner by clicking on test names and play around to get started.

Whenever we add a new test, it will be visible in Cypress Test Runner.

### Add a test in Portal API Pipeline

If you're writing a _new test_ , you will have to add it inside the `cypress/integrations/Api_Tests` directory.

**Currently, we have 2 categories of API -**

- **[REST API](https://litmuschaos.github.io/litmus/auth/v2.0.0/api.html)** for Litmus Portal Authentication

- **[GraphQL API](https://litmuschaos.github.io/litmus/graphql/v2.9.0/api.html)** for ChaosCenter

If you are adding a new category, than create a directory according to test case and add the same as a job in github actions [workflow](https://github.com/litmuschaos/litmus-e2e/actions/workflows/portal-pipeline.yml)

While adding a test for an existing category, just add the test in category according to the test-case scenario. Pipeline will automatically execute the newly added test along with other tests.

A sample PR flow is outlined [here](https://guides.github.com/introduction/flow/). More detailed one is [here](https://gist.github.com/Chaser324/ce0505fbed06b947d962).

### Guidelines for writing API Tests -

These are minor guidelines or support points for new contributors -

- Try not to test same scenario repeatedly. For e.g. The login feature is already tested in login test, so we should avoid testing it again while writing new test, as all scenarios starts from login only.

- If you want use some mock data in your tests, add the same in fixtures directory and import it into your test, so that it will be reusable and scalable.

- Write all the URL in `fixtures/endpoints.js` and import that in your tests. This ensures that in future if any URL changes then we need to update only one file.

- Similarly write all the GraphQL queries and mutations in graphql folder.

### Sign your work

We use the Developer Certificate of Origin (DCO) as an additional safeguard for the LitmusChaos project. This is a well established and widely used mechanism to assure that contributors have confirmed their right to license their contribution under the project's license. Please add a line to every git commit message:

```
  Signed-off-by: Random J Developer <random@developer.example.org>
```

The email id should match the email id provided in your GitHub profile.

If you set your `user.name` and `user.email` in git config, you can sign your commit automatically with `git commit -s`.

You can also use git [aliases](https://git-scm.com/book/tr/v2/Git-Basics-Git-Aliases) like `git config --global alias.ci 'commit -s'`. Now you can commit with `git ci` and the commit will be signed.
