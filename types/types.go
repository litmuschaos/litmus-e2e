package tests

import (
	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	chaosClient "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	"k8s.io/client-go/kubernetes"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	restclient "k8s.io/client-go/rest"
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
	ExperimentRepoName = "litmuschaos"
	//OperatorRepoName of the image to be used in operator
	// default: "litmuschaos"
	OperatorRepoName = "litmuschaos"
	//RunnerRepoName of the image to be used in runner
	// default: "litmuschaos"
	RunnerRepoName = "litmuschaos"
	//RunnerImage name default: "chaos-runner"
	RunnerImage = "chaos-runner"
	//OperatorImage name default: "chaos-operator"
	OperatorImage = "chaos-operator"
	//ExperimentImage name default: "ansible-runner"
	ExperimentImage = "ansible-runner"
	//ExperimentImageTag "latest or ci"
	ExperimentImageTag = "ci"
	//OperatorImageTag "latest or ci"
	OperatorImageTag = "ci"
	//RunnerImageTag "latest or ci"
	RunnerImageTag = "ci"
	//ChaosDuration of the Experiment
	ChaosDuration = ""

	Kubeconfig string
	Config     *restclient.Config
	Client     *kubernetes.Clientset
	ClientSet  *chaosClient.LitmuschaosV1alpha1Client
	//InstallLitmus : Path to create operator
	InstallLitmus = "https://raw.githubusercontent.com/litmuschaos/pages/master/docs/litmus-operator-latest.yaml"
	//LitmusCrd : Path to litmus crds
	LitmusCrd = "https://raw.githubusercontent.com/litmuschaos/chaos-operator/master/deploy/chaos_crds.yaml"
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
