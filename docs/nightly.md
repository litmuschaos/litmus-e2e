# Nightly build

```
nightly workflows ──► JUnit artifacts + job results ──► Nightly-Report workflow ──► GitHub Pages
 (schedule, 20:30 - 22:30 UTC)                          scripts/report/build_report.py   dashboard/ + data/*.json
```

| Workflow | Suite | Required | Cluster |
|----------|-------|----------|---------|
| `nightly-pod-level-pipeline.yml` | Experiment BDD | yes | k3s |
| `nightly-component-pipeline.yml` | Experiment BDD | yes | k3s |
| `nightly-node-level-pipeline.yml` | Experiment BDD | yes | kind, 3 nodes |
| `nightly-chaoscenter-pipeline.yml` | Frontend E2E (Cypress) | yes | minikube + Helm |
| `nightly-aws-/azure-/gcp-/vmware-/m-agent-*-pipeline` | Experiment BDD, cloud | no, need credentials | k3s |

A build is `passed` only when every required workflow passed, `failed` when one failed and `incomplete` when a required
workflow did not run or finish. See `scripts/report/schema.md` for how results and metrics are computed.

## What was broken

The runs of the nightly workflows in the fork (every night since 29 September) all failed, and the cause was the first
step of every job:

* `curl https://get.k3s.io | INSTALL_K3S_VERSION=v1.21.11+k3s1 sh -s - --docker` ends with
  `Job for k3s.service failed because the control process exited with error code` on the current `ubuntu-latest`.
* Every later step used `if: always()`, so the pipeline kept going without a cluster. One infrastructure failure
  became 5 to 10 red steps per job, and the tests reported failures that were not test failures.
* The workflows checked out `litmuschaos/litmus-e2e@master` instead of the repository they run in, so a fork never tested
  its own changes.
* `nightly-node-level-pipeline.yml` ran on `[self-hosted, node-level]` runners and `nightly-portal-pipeline.yml` on the
  retired `ubuntu-20.04` image: those runs were queued or cancelled every night.
* The dashboard read its data from `https://e2edashboardbackend.herokuapp.com`, which answers 404 (the Heroku app is gone),
  and the frontend tests were not part of any nightly workflow.

## What changed

* `.github/actions/setup-k3s`: installs a supported k3s release (containerd, no Docker), waits for the node and
  CoreDNS, and fails the job with the k3s journal when the cluster does not come up.
* The test steps run only when the cluster, Litmus and the application are ready (`steps.<id>.outcome`), so an
  infrastructure failure is one failed step and the tests are reported as skipped, not as failed.
* The Go suites write a JUnit report per test file when `JUNIT_REPORT_DIR` is set (`pkg.RunSpecs`), and the workflows upload
  it as `bdd-junit-<job>`. Cypress writes `chaoscenter-e2e-junit`.
* `nightly-chaoscenter-pipeline.yml` runs the ChaosCenter Cypress suite every night.
* `nightly-node-level-pipeline.yml` runs on a 3 node kind cluster on GitHub hosted runners.
* `nightly-portal-pipeline.yml` is removed: it installed manifests that no longer exist and is replaced by the ChaosCenter workflow.
* `Nightly-Report` builds the report data and publishes it to GitHub Pages.

## Set up in a repository

1. Settings > Pages > Source: **GitHub Actions**. This replaces the content served from the `gh-pages` branch.
2. Run `Nightly-Report` once with *Run workflow*. Without earlier history it backfills the last 7 days from the Actions API.
3. Cloud workflows need their secrets (`AWS_*`, `AZURE_*`, `GCP_SA_KEY`, ...). Without them they fail at the
   authentication step and are reported as infrastructure failures of an optional suite.

## Validate in a fork

```bash
gh workflow run nightly-component-pipeline.yml      # smallest BDD pipeline
gh workflow run nightly-chaoscenter-pipeline.yml
gh workflow run nightly-node-level-pipeline.yml     # kind, not run before this change
gh workflow run nightly-report.yml
```

Scheduled workflows only run on the default branch and GitHub disables them after 60 days without repository activity.

## Known limitations

* The workflows could not be executed where these changes were made, they are validated by parsing and by the report
  generator tests. The k3s, kind, minikube and Cypress steps need a first run in the fork.
* BDD results are per Ginkgo spec only for runs that uploaded JUnit, others are reported per job.
* `utils/result_update.py`, `utils/pipeline_status_update.py` and `pkg/update.go` push results to the `gh-pages` branch of the
  upstream repository and link to a GitLab instance that does not exist anymore. Nothing calls them from the nightly
  workflows, they can be removed.
