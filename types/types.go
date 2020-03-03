package tests

import (
	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
)

var (

	// Namespace where the chaos will be performed
	ChaosNamespace = "litmus"

	// Namespace where the csp pods are deployed
	CspPodNs = "openebs"

	//Label of the CSP Pods
	CspPodLabels = "app=cstor-pool"

	//Namespace where target pod is deployed
	TargetPodNs = "openebs"

	//Label of the target pod
	TargetPodLabels = "openebs.io/target=cstor-target"

	//Chaos Duration of the Experiment
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
