package tests

import (
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
	ExperimentRepoName = "litmuschaos"
	//OperatorRepoName of the image to be used in operator
	OperatorRepoName = "litmuschaos"
	//RunnerRepoName of the image to be used in runner
	RunnerRepoName = "litmuschaos"
	//RunnerImage name
	RunnerImage = "chaos-runner"
	//OperatorImage name
	OperatorImage = "chaos-operator"
	//ExperimentImage name
	ExperimentImage = "ansible-runner"
	//ExperimentImageTag "latest or ci"
	ExperimentImageTag = "ci"
	//OperatorImageTag "latest or ci"
	OperatorImageTag = "ci"
	//RunnerImageTag "latest or ci"
	RunnerImageTag = "ci"
	//ChaosDuration of the Experiment
	ChaosDuration = ""
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
