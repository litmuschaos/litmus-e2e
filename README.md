# Litmus-E2E
The goal of litmus e2e is to provide the test suite to demonstrate the chaos experiment behavior in different scenarios. As the name suggests this repository is for testing the generic and litmus portal test suites which includes different cypress test, pod and node-level chaos experiment testing like resource chaos, network chaos, disk, and io chaos, and others. Apart from this the infra component of litmus which is crds and operator is also tested under this branch. Chaos testing is powered by GitLab. There are 3 different pipelines (triggers according to GitLab env) that execute all the tests. These are:

1. ***Application Level pipeline:*** It executes all pod level tests.
2. ***Infra Level pipeline:*** It executes all infra/node level tests.
3. ***Component Level pipeline:*** It executes some component level tests.

The `.gitlab-ci.yml` uses local templates (stored under the templates directory in root repo) to run each of these pipelines.

## Why Litmus e2e Matters?

- The End-to-end (e2e) tests for chaos experiment provide a mechanism to test the behavior of the chaos experiment and is the last signal to ensure end-user operations match developer specifications which include the chaos experiment validation and verification of different functionalities like a probe, abort, and others. Although unit and integration tests provide a good signal, in a distributed system like Kubernetes it is not uncommon that a minor change may pass all unit and integration tests, but cause unforeseen changes at the system level.

- The primary objectives of the litmus e2e tests are to ensure consistent and reliable behavior of the experiment business logic and to catch hard-to-test bugs before users do when unit and integration tests are insufficient.

## The Scheduled builds
Pipelines are normally run based on certain conditions being met. For example, when a branch is pushed to the repository. Similarly, Pipeline schedules can be used to also run pipelines at specific intervals.
GitLab provides a scheduling option that is easy to configure. The litmus generic tests are also scheduled and can be visualized in [e2e portal](https://litmuschaos.github.io/litmus-e2e/generic-pipeline/generic). It has the following scheduled builds:

- [Daily Nightly Builds](https://litmuschaos.github.io/litmus-e2e/generic-pipeline/generic#daily-nightly-builds)
- [Release Candidate(RC) Build](https://litmuschaos.github.io/litmus-e2e/generic-pipeline/generic#release-candidaterc-build)
- [General Availability(GA) Build](https://litmuschaos.github.io/litmus-e2e/generic-pipeline/generic#general-availabilityga-build)


## Working Group Information
There is a [Special Interest Groups (SIG)](https://github.com/litmuschaos/litmus/wiki/Special-Interest-Groups#sig-testing) to test the litmus components. To contribute to or use the test suite you can join the [slack channel](https://kubernetes.slack.com/archives/CNXNB0ZTN), weekly meetings, and interact in GitHub via issues.

## Test Suite Information
- Instructions - TBD
- FAQ - TBD

## Introduce a new test scenario
- For adding a new test scenario that is missing, feel free to add a Pull Request(PR) which includes the entry of the test details in [.master-plan.yml](https://github.com/litmuschaos/litmus-e2e/blob/master/.master-plan.yml) also make sure that the test is not already mentioned in that list. You can also use [GitHub issues](https://github.com/litmuschaos/litmus-e2e/issues) or [slack channel](https://kubernetes.slack.com/archives/CNXNB0ZTN) for any discussion if required. You can also pick up a test form `.master-plan.yml` to start working with a new test in e2e.
- To know more check out the format to add a PR for including a test scenario from [master-plan.md](https://github.com/litmuschaos/litmus-e2e/blob/master/master-plan.md).
