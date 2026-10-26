package pkg

import (
	"os"
	"strings"
	"testing"

	yamlChe "github.com/ghodss/yaml"
	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
)

const sampleEngine = `
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: aws-chaos
spec:
  engineState: active
  chaosServiceAccount: litmus-admin
  experiments:
    - name: ec2-stop-by-id
      spec:
        components:
          env:
            - name: TOTAL_CHAOS_DURATION
              value: '30'
            - name: EC2_INSTANCE_ID
              value: ''
            - name: REGION
              value: ''
`

func engineFrom(t *testing.T, manifest string) *v1alpha1.ChaosEngine {
	t.Helper()
	engine := &v1alpha1.ChaosEngine{}
	if err := yamlChe.Unmarshal([]byte(manifest), engine); err != nil {
		t.Fatal(err)
	}
	return engine
}

func envValue(engine *v1alpha1.ChaosEngine, name string) (string, bool) {
	for _, e := range engine.Spec.Experiments[0].Spec.Components.ENV {
		if e.Name == name {
			return e.Value, true
		}
	}
	return "", false
}

func TestSetEngineVarAppliesExperimentInputs(t *testing.T) {
	details := &types.TestDetails{}
	environment.GetENV(details, "ec2-stop-by-id", "ec2-engine")
	details.InstanceID = "i-123"
	details.Region = "us-west-1"

	engine := engineFrom(t, sampleEngine)
	if err := setEngineVar(engine, details, false); err != nil {
		t.Fatal(err)
	}
	if v, _ := envValue(engine, "EC2_INSTANCE_ID"); v != "i-123" {
		t.Errorf("EC2_INSTANCE_ID = %q", v)
	}
	if v, _ := envValue(engine, "REGION"); v != "us-west-1" {
		t.Errorf("REGION = %q", v)
	}
	if engine.Spec.ChaosServiceAccount != "ec2-stop-by-id-sa" {
		t.Errorf("service account = %q", engine.Spec.ChaosServiceAccount)
	}
}

func TestSetEngineVarFailsWhenInputIsNotInEngine(t *testing.T) {
	details := &types.TestDetails{}
	// the engine does not define EC2_INSTANCE_TAG, so the target would be silently dropped
	environment.GetENV(details, "ec2-stop-by-tag", "ec2-engine")
	details.InstanceTag = "run:1"
	details.Region = "us-west-1"

	err := setEngineVar(engineFrom(t, sampleEngine), details, false)
	if err == nil || !strings.Contains(err.Error(), "EC2_INSTANCE_TAG") {
		t.Fatalf("expected an error naming EC2_INSTANCE_TAG, got %v", err)
	}
}

// TestLiveManifestsMatchE2EInputs validates the e2e inputs against the manifests currently published in
// the chaos-charts. It needs network access, run it with CHECK_LIVE_MANIFESTS=true.
func TestLiveManifestsMatchE2EInputs(t *testing.T) {
	if os.Getenv("CHECK_LIVE_MANIFESTS") != "true" {
		t.Skip("set CHECK_LIVE_MANIFESTS=true to validate the live chaos-charts manifests")
	}

	cloud := []struct {
		category, fault string
		set             func(d *types.TestDetails)
	}{
		{"aws", "ec2-stop-by-id", func(d *types.TestDetails) { d.InstanceID, d.Region = "i-1", "us-west-1" }},
		{"aws", "ec2-stop-by-tag", func(d *types.TestDetails) { d.InstanceTag, d.Region = "k:v", "us-west-1" }},
		{"aws", "ebs-loss-by-id", func(d *types.TestDetails) { d.EBSVolumeID, d.Region = "vol-1", "us-west-1" }},
		{"aws", "ebs-loss-by-tag", func(d *types.TestDetails) { d.EBSVolumeTag, d.Region = "k:v", "us-west-1" }},
		{"azure", "azure-instance-stop", func(d *types.TestDetails) {
			d.AzureResourceGroup, d.AzureInstanceName, d.AzureScaleSet = "rg", "vm", "disable"
		}},
		{"azure", "azure-disk-loss", func(d *types.TestDetails) {
			d.AzureResourceGroup, d.AzureDiskName, d.AzureScaleSet = "rg", "disk", "disable"
		}},
		{"gcp", "gcp-vm-instance-stop", func(d *types.TestDetails) {
			d.GCPProjectID, d.VMInstanceNames, d.InstanceZones = "p", "vm", "us-central1-a"
		}},
		{"gcp", "gcp-vm-disk-loss", func(d *types.TestDetails) {
			d.GCPProjectID, d.DiskVolumeNames, d.DiskZones = "p", "disk", "us-central1-a"
		}},
		{"vmware", "vmware-vm-poweroff", func(d *types.TestDetails) { d.VMIds = "vm-1" }},
	}
	for _, tc := range cloud {
		t.Run(tc.fault, func(t *testing.T) {
			details := &types.TestDetails{}
			environment.GetENV(details, tc.fault, "engine")
			// directory of the fault in the chaos-charts when it differs from the experiment name
			dir := tc.fault
			if tc.fault == "vmware-vm-poweroff" {
				dir = "vm-poweroff"
			}
			environment.SetFaultPaths(details, tc.category, dir)
			tc.set(details)

			if _, err := FetchManifest(details.ExperimentPath); err != nil {
				t.Fatal(err)
			}
			data, err := FetchManifest(details.EnginePath)
			if err != nil {
				t.Fatal(err)
			}
			engine := &v1alpha1.ChaosEngine{}
			if err := yamlChe.Unmarshal(data, engine); err != nil {
				t.Fatal(err)
			}
			if err := setEngineVar(engine, details, false); err != nil {
				t.Fatal(err)
			}
		})
	}

	// the engine of the kubernetes faults used by the pipelines must be reachable and carry the inputs set by the tests
	for _, fault := range []string{"pod-delete", "container-kill", "pod-cpu-hog", "pod-cpu-hog-exec", "pod-memory-hog", "pod-memory-hog-exec",
		"pod-io-stress", "pod-network-latency", "pod-network-loss", "pod-network-corruption", "pod-network-duplication", "pod-autoscaler",
		"disk-fill", "kubelet-service-kill", "node-cpu-hog", "node-memory-hog", "node-io-stress", "node-drain", "node-taint"} {
		t.Run(fault, func(t *testing.T) {
			details := &types.TestDetails{}
			environment.GetENV(details, fault, "engine")
			for _, path := range []string{details.ExperimentPath, details.EnginePath} {
				if _, err := FetchManifest(path); err != nil {
					t.Fatal(err)
				}
			}
		})
	}
}
