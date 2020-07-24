package tests

import (
	"os"

	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	chaosClient "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	"k8s.io/client-go/kubernetes"
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
	ExperimentRepoName = os.Getenv("EXPERIMENT_REPO_NAME")
	//OperatorRepoName of the image to be used in operator
	OperatorRepoName = os.Getenv("OPERATOR_REPO_NAME")
	//RunnerRepoName of the image to be used in runner
	RunnerRepoName = os.Getenv("RUNNER_REPO_NAME")
	//RunnerImage name
	RunnerImage = os.Getenv("RUNNER_IMAGE")
	//OperatorImage name
	OperatorImage = os.Getenv("OPERATOR_IMAGE")
	//ExperimentImage name
	ExperimentImage = os.Getenv("EXPERIMENT_IMAGE")
	//ExperimentImageTag "latest or ci"
	ExperimentImageTag = os.Getenv("EXPERIMENT_IMAGE_TAG")
	//OperatorImageTag "latest or ci"
	OperatorImageTag = os.Getenv("OPERATOR_IMAGE_TAG")
	//RunnerImageTag "latest or ci"
	RunnerImageTag = os.Getenv("RUNNER_IMAGE_TAG")
	//ChaosDuration of the Experiment
	ChaosDuration = ""

	Kubeconfig string
	Config     *restclient.Config
	Client     *kubernetes.Clientset
	ClientSet  *chaosClient.LitmuschaosV1alpha1Client
	//InstallLitmus : Path to create operator
	InstallLitmus = "https://litmuschaos.github.io/litmus/litmus-operator-v1.6.1.yaml"
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
