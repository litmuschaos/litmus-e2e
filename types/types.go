package tests

import (
	"os"

	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
)

var (

	// ChaosNamespace where the chaos will be performed
	ChaosNamespace = "litmus"
	// CspPodNs where the csp pods are deployed
	CspPodNs = "openebs"
	//CspPodLabels of the CSP Pods
	CspPodLabels = "app=cstor-pool"
	//TargetPodNs Namespace where target pod is deployed
	TargetPodNs = "openebs"
	//TargetPodLabels Label of the target pod
	TargetPodLabels = "openebs.io/target=cstor-target"
	//ExperimentRepoName of the image to be used in experiment
	// default: "litmuschaos"
	ExperimentRepoName = os.Getenv("EXPERIMENT_REPO_NAME")
	//OperatorRepoName of the image to be used in operator
	// default: "litmuschaos"
	OperatorRepoName = os.Getenv("OPERATOR_REPO_NAME")
	//RunnerRepoName of the image to be used in runner
	// default: "litmuschaos"
	RunnerRepoName = os.Getenv("RUNNER_REPO_NAME")
	//RunnerImage name default: "chaos-runner"
	RunnerImage = os.Getenv("RUNNER_IMAGE")
	//OperatorImage name default: "chaos-operator"
	OperatorImage = os.Getenv("OPERATOR_IMAGE")
	//ExperimentImage name default: "ansible-runner"
	ExperimentImage = os.Getenv("EXPERIMENT_IMAGE")
	//ExperimentImageTag "latest or ci"
	ExperimentImageTag = os.Getenv("EXPERIMENT_IMAGE_TAG")
	//OperatorImageTag "latest or ci"
	OperatorImageTag = os.Getenv("OPERATOR_IMAGE_TAG")
	//RunnerImageTag "latest or ci"
	RunnerImageTag = os.Getenv("RUNNER_IMAGE_TAG")
	//ChaosDuration of the Experiment
	ChaosDuration = ""

	//rbacPath of different chaos experiments
	PodDeleteRbacPath            = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-delete/rbac.yaml"
	ContainerKillRbacPath        = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/container-kill/rbac.yaml"
	DiskFillRbacPath             = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/disk-fill/rbac.yaml"
	NodeCPUHogRbacPath           = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/node-cpu-hog/rbac.yaml"
	NodeDrainRbacPath            = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/node-drain/rbac.yaml"
	NodeMemoryHogRbacPath        = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/node-memory-hog/rbac.yaml"
	PodCPUHogRbacPath            = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-cpu-hog/rbac.yaml"
	PodMemoryHogRbacPath         = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-memory-hog/rbac.yaml"
	PodNetworkCorruptionRbacPath = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-network-corruption/rbac.yaml"
	PodNetworkLatencyRbacPath    = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-network-latency/rbac.yaml"
	PodNetworkLossRbacPath       = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-network-loss/rbac.yaml"

	//experimentPath of different chaosexperiments
	PodDeleteExperimentPath            = "https://hub.litmuschaos.io/api/chaos?file=charts/generic/pod-delete/experiment.yaml"
	ContainerKillExperimentPath        = "https://hub.litmuschaos.io/api/chaos?file=charts/generic/container-kill/experiment.yaml"
	DiskFillExperimentPath             = "https://hub.litmuschaos.io/api/chaos?file=charts/generic/disk-fill/experiment.yaml"
	NodeCPUHogExperimentPath           = "https://hub.litmuschaos.io/api/chaos?file=charts/generic/node-cpu-hog/experiment.yaml"
	NodeDrainExperimentPath            = "https://hub.litmuschaos.io/api/chaos?file=charts/generic/node-drain/experiment.yaml"
	NodeMemoryHogExperimentPath        = "https://hub.litmuschaos.io/api/chaos?file=charts/generic/node-memory-hog/experiment.yaml"
	PodCPUHogExperimentPath            = "https://hub.litmuschaos.io/api/chaos?file=charts/generic/pod-cpu-hog/experiment.yaml"
	PodMemoryHogExperimentPath         = "https://hub.litmuschaos.io/api/chaos?file=charts/generic/pod-memory-hog/experiment.yaml"
	PodNetworkCorruptionExperimentPath = "https://hub.litmuschaos.io/api/chaos?file=charts/generic/pod-network-corruption/experiment.yaml"
	PodNetworkLatencyExperimentPath    = "https://hub.litmuschaos.io/api/chaos?file=charts/generic/pod-network-latency/experiment.yaml"
	PodNetworkLossExperimentPath       = "https://hub.litmuschaos.io/api/chaos?file=charts/generic/pod-network-loss/experiment.yaml"

	//enginePath of different chaosengines
	PodDeleteEnginePath            = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-delete/engine.yaml"
	ContainerKillEnginePath        = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/container-kill/engine.yaml"
	DiskFillEnginePath             = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/disk-fill/engine.yaml"
	NodeCPUHogEnginePath           = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/node-cpu-hog/engine.yaml"
	NodeDrainEnginePath            = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/node-drain/engine.yaml"
	NodeMemoryHogEnginePath        = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/node-memory-hog/engine.yaml"
	PodCPUHogEnginePath            = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-cpu-hog/engine.yaml"
	PodMemoryHogEnginePath         = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-memory-hog/engine.yaml"
	PodNetworkCorruptionEnginePath = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-network-corruption/engine.yaml"
	PodNetworkLatencyEnginePath    = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-network-latency/engine.yaml"
	PodNetworkLossEnginePath       = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-network-loss/engine.yaml"
)

// EngineDetails struct is for collecting all the engine-related details
type EngineDetails struct {
	Name             string
	Experiments      []string
	AppLabel         string
	SvcAccount       string
	AppKind          string
	AppNamespace     string
	ClientUUID       string
	AuxiliaryAppInfo string
	UID              string
}

// ExperimentDetails is for collecting all the experiment-related details
type ExperimentDetails struct {
	Name       string
	Env        map[string]string
	ExpLabels  map[string]string
	ExpImage   string
	ExpArgs    []string
	JobName    string
	Namespace  string
	ConfigMaps []v1alpha1.ConfigMap
	Secrets    []v1alpha1.Secret
	SvcAccount string
}

// PodDetails struct is for collecting all pod details
type PodDetails struct {
	PodName      string
	PodNamespace string
	PodLabel     string
	PodKind      string
}
