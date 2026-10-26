# Nightly report data

`build_report.py` writes two files that the dashboard reads. Both start with `schemaVersion`, `generatedAt` and
`repository`. The generator validates them before they are written (`validate()`), a violation fails the job instead of
publishing broken data.

## latest.json

| Field | Meaning |
|-------|---------|
| `build` | The newest nightly build, `null` when no nightly workflow ran in the history window. |
| `build.id` | Name of the cycle (see below), `YYYY-MM-DD`. |
| `build.status` | `passed`, `failed` or `incomplete`. Passed only when every **required** workflow ran and passed. Failed when a required workflow failed. Incomplete when a required workflow did not run, was cancelled, skipped or is still running. |
| `build.stale` / `build.ageHours` | `true` when the build started more than `staleAfterHours` ago, so an old result is never shown as the latest one. |
| `build.suites.<id>` | `status` and `counts` of the required workflows of the suite (`bdd`, `frontend`), and `optionalCounts` of its optional workflows (cloud). Suites are never merged into one pass rate. |
| `build.workflows[]` | One entry per configured workflow: `status` (`passed`, `failed`, `cancelled`, `skipped`, `in_progress`, `not_run`), `required`, `runUrl`, `durationSec`, `jobs[]` (conclusion, first failed step), `counts`, `resultsSource` (`junit`, `jobs` or `none`) and `failureKind` (`tests` or `infrastructure`). |
| `tests[]` | The results of the build. `status` is `passed`, `failed`, `skipped` or `error`. `kind` is `test`, `setup` (install, deploy, cleanup) or `job`. `source` is `junit` or `job`. |
| `coverage` | The experiments defined in the repository (`tests/`, `components/`, `platform/`), those scheduled by a required nightly workflow, those executed by the build and the ones that are not scheduled. The cloud experiments of the optional workflows are listed apart (`cloud`), they are supported but not part of the nightly build. |
| `metrics` | Values derived from `history.json`, see below. |

`error` is a job that failed before its tests could run (for example the cluster did not start). `skipped` is a job or
test that did not run. Neither is ever counted as passing, and `passRate` is `passed / (passed + failed + error)`.
A passing setup step is not counted as a test.

### Cycles

The nightly workflows start at different hours, some after midnight. A cycle is the 24 hour window starting at
`cycleStartHourUtc` (12:00 UTC) and is named after its first day. Of the runs of a workflow on the default branch
(`schedule` and `workflow_dispatch`) the newest one represents the cycle.

### Metrics

| Metric | Source and definition |
|--------|-----------------------|
| `newlyFailing` / `recovered` | Tests failing (or erroring) in the latest build and passing in the previous one, and the reverse. Needs two builds. |
| `recurringFailures` | Tests failing in at least two consecutive builds, with the length of the streak. |
| `flakyTests` | Tests with at least 4 results in the last 14 builds, both passes and failures, and at least 2 changes between passing and failing. Not reported without that evidence. |
| `durationChange` | Duration of the latest build against the previous one. |
| `longestTests` | Slowest tests of the latest build, from the JUnit `time`. |
| `coverage.executedPercent` | Executed experiments of the scheduled experiments. |

## history.json

`builds[]` is ordered by `id`, capped to `maxBuildsKept`. Each build keeps the status of the build, suites and
workflows and `results`, a map from test id to `p`, `f`, `s` or `e`, which is what the metrics are computed from.
The file published earlier is read back (`--previous`) and merged, so the history grows past what the Actions API
still returns. A missing or unreadable file starts a new history.

## Sources

* Runs and jobs: the Actions API of the repository.
* Test results: JUnit artifacts of the runs, `bdd-junit-<job>` written by the Go suites when `JUNIT_REPORT_DIR` is
  set (`pkg.RunSpecs`) and `chaoscenter-e2e-junit` written by Cypress. Runs without these artifacts are reported at job
  level.
* The experiment catalogue: the test files, the `Makefile` targets and the `make` steps of the nightly workflows.
