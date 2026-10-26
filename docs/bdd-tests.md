# Experiment BDD tests

The experiment tests are Ginkgo suites run with `go test` through the `Makefile` targets
(`make <experiment>`). Each suite installs the RBAC, `ChaosExperiment` and `ChaosEngine` of a fault
from the [chaos-charts](https://github.com/litmuschaos/chaos-charts), waits for the run and asserts the
`ChaosResult` and `ChaosEngine` verdicts.

| Directory | Suites |
|-----------|--------|
| `tests/` | pod-level and node-level experiments, experiment tunables, install and cleanup |
| `components/` | operator, engine, experiment and result checks |
| `platform/` | AWS, Azure, GCP, VMware and OS experiments (need cloud credentials) |

## Checks that do not need a cluster

```bash
go build ./...
go vet ./...
go test ./pkg/ -count=1
# validates every fault the suites use against the manifests currently published in the chaos-charts
CHECK_LIVE_MANIFESTS=true go test ./pkg/ -run TestLiveManifestsMatchE2EInputs -count=1 -v
```

## Running a suite

A cluster with `KUBECONFIG` set and the `litmus` namespace is required:

```bash
make build-litmus app-deploy
make pod-delete                       # any target of the Makefile
make app-cleanup litmus-cleanup
```

Cloud suites additionally need the secrets and target resources listed in the matching
`.github/workflows/*-experiment-pipeline.yml`.

## Manifest layout

The manifests are read from `faults/<category>/<fault>/{fault,engine}.yaml` of the chaos-charts.
The ChaosHub API answers a missing file with HTTP 200 and an error text, so downloads are validated
by `pkg.FetchManifest` and the suites fail with the URL that could not be read.
Faults outside `faults/kubernetes` use `environment.SetFaultPaths(&testsDetails, "<category>", "<fault dir>")`.
The RBAC is no longer published per fault, the default admin RBAC (`RBAC_PATH`) is used.

## Experiment status

"Manifests verified" means the fault and engine manifests of the experiment were fetched and the inputs
set by the suite were matched against the engine envs (`TestLiveManifestsMatchE2EInputs`).
No suite was executed against a cluster in the environment these changes were made in.

| Experiment | Manifests verified | Executed against a cluster |
|------------|--------------------|----------------------------|
| pod-delete, container-kill | yes | not run |
| pod-cpu-hog, pod-cpu-hog-exec, pod-memory-hog, pod-memory-hog-exec, pod-io-stress | yes | not run |
| pod-network-latency, -loss, -corruption, -duplication | yes | not run |
| pod-autoscaler, disk-fill, kubelet-service-kill | yes | not run |
| node-cpu-hog, node-memory-hog, node-io-stress, node-drain, node-taint | yes | not run, multi node cluster required |
| ec2-stop-by-id, ec2-stop-by-tag, ebs-loss-by-id, ebs-loss-by-tag | yes | blocked, AWS credentials |
| azure-instance-stop, azure-disk-loss | yes | blocked, Azure credentials |
| gcp-vm-instance-stop, gcp-vm-disk-loss | yes | blocked, GCP credentials |
| vmware-vm-poweroff | yes | blocked, vCenter |
| process-kill (m-agent) | no, uses the `m-agent` branch of chaos-charts | blocked, VM and m-agent |
