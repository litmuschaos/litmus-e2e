# ChaosCenter E2E tests

Cypress suites for ChaosCenter: `cypress/e2e/REST APIs` calls the auth and GraphQL APIs directly,
`cypress/e2e/UI` drives the web interface. Specs run in file order and share state (for example the
environment created by the REST specs is reused by the UI specs), so run the whole suite against a fresh
ChaosCenter installation.

```bash
cd chaoscenter
npm ci
CYPRESS_baseUrl=http://<chaoscenter-frontend> npx cypress run
```

`username` and `password` default to the ChaosCenter defaults and can be overridden with
`CYPRESS_username` / `CYPRESS_password`. JUnit results are written to `results/`.

## Asserting on the UI

The UI specs assert on the GraphQL and auth calls made by the page. They used to register handlers for
browser alerts under event names Cypress does not emit (and which referenced an undefined `message`), so
nothing was asserted. Register the call before the action that triggers it:

```js
cy.interceptGraphQL('addChaosHub', 'addChaosHub');
cy.get('button[aria-label = "Connect Hub"]').click();
cy.expectGraphQLSuccess('addChaosHub');      // or cy.expectGraphQLError('addChaosHub', 'name already exists')
```

The workflow `.github/workflows/E2E-chaoscenter-pipeline.yml` installs ChaosCenter with Helm on minikube and
uploads the JUnit results and the screenshots of failed tests as artifacts.
