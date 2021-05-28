package types

// TestDetails is for collecting all the test-related details
type TestDetails struct {
	ExperimentName            string
	EngineName                string
	OperatorName              string
	ChaosNamespace            string
	RbacPath                  string
	ExperimentPath            string
	EnginePath                string
	AnsibleRbacPath           string
	AnsibleExperimentPath     string
	AnsibleEnginePath         string
	AnsibleExperimentImage    string
	AppNS                     string
	AppLabel                  string
	JobCleanUpPolicy          string
	AnnotationCheck           string
	ApplicationNodeName       string
	GoExperimentImage         string
	InstallLitmus             string
	OperatorImage             string
	ImagePullPolicy           string
	ExperimentImagePullPolicy string
	RunnerImage               string
	ChaosDuration             int
	AdminRbacPath             string
	ChaosServiceAccount       string
	NewExperimentName         string
	NodeSelectorName          string
	Delay                     int
	Duration                  int
	TargetPod                 string
	LibImage                  string
	FillPercentage            int
	CPUKillCommand            string
	MemoryKillCommand         string
	NetworkLatency            string
	UpdateWebsite             string
	InstanceID                string
	Region                    string
	Lib                       string
	PodsAffectedPercentage    string
	Sequence                  string
}

//ChaosExperiment is go struct for Experiment
type ChaosExperiment struct {
	APIVersion  string `json:"apiVersion,omitempty"`
	Description struct {
		Message string `json:"message,omitempty"`
	} `json:"description,omitempty"`
	Kind     string `json:"kind,omitempty"`
	Metadata struct {
		Name   string `json:"name,omitempty"`
		Labels struct {
			Name                     string `json:"name,omitempty"`
			AppKubernetesIoPartOf    string `json:"app.kubernetes.io/part-of,omitempty"`
			AppKubernetesIoComponent string `json:"app.kubernetes.io/component,omitempty"`
			AppKubernetesIoVersion   string `json:"app.kubernetes.io/version,omitempty"`
		} `json:"labels,omitempty"`
	} `json:"metadata,omitempty"`
	Spec struct {
		Definition struct {
			Scope       string `json:"scope,omitempty"`
			Permissions []struct {
				APIGroups []string `json:"apiGroups,omitempty"`
				Resources []string `json:"resources,omitempty"`
				Verbs     []string `json:"verbs,omitempty"`
			} `json:"permissions,omitempty"`
			Image           string   `json:"image,omitempty"`
			ImagePullPolicy string   `json:"imagePullPolicy,omitempty"`
			Args            []string `json:"args,omitempty"`
			Command         []string `json:"command,omitempty"`
			Env             []struct {
				Name  string `json:"name"`
				Value string `json:"value"`
			} `json:"env,omitempty"`
			Labels struct {
				Name                     string `json:"name,omitempty"`
				AppKubernetesIoPartOf    string `json:"app.kubernetes.io/part-of,omitempty"`
				AppKubernetesIoComponent string `json:"app.kubernetes.io/component,omitempty"`
				AppKubernetesIoVersion   string `json:"app.kubernetes.io/version,omitempty"`
			} `json:"labels,omitempty"`
		} `json:"definition,omitempty"`
	} `json:"spec,omitempty"`
}

//ChaosEngine is go struct for Engine
type ChaosEngine struct {
	APIVersion string `json:"apiVersion,omitempty"`
	Kind       string `json:"kind,omitempty"`
	Metadata   struct {
		Name      string `json:"name,omitempty"`
		Namespace string `json:"namespace,omitempty"`
	} `json:"metadata,omitempty"`
	Spec struct {
		AnnotationCheck string `json:"annotationCheck,omitempty"`
		EngineState     string `json:"engineState,omitempty"`
		Appinfo         struct {
			Appns    string `json:"appns,omitempty"`
			Applabel string `json:"applabel,omitempty"`
			Appkind  string `json:"appkind,omitempty"`
		} `json:"appinfo"`
		ChaosServiceAccount string `json:"chaosServiceAccount,omitempty"`
		JobCleanUpPolicy    string `json:"jobCleanUpPolicy,omitempty"`
		Components          struct {
			Runner struct {
				ImagePullPolicy string `json:"imagePullPolicy,omitempty"`
			} `json:"runner,omitempty"`
		} `json:"components,omitempty"`
		Experiments []struct {
			Name string `json:"name,omitempty"`
			Spec struct {
				Components struct {
					NodeSelector struct {
						KubernetesIoHostname string `json:"kubernetes.io/hostname,omitempty"`
					} `json:"nodeSelector,omitempty"`
					Env []struct {
						Name  string `json:"name"`
						Value string `json:"value"`
					} `json:"env,omitempty"`
				} `json:"components,omitempty"`
			} `json:"spec,omitempty"`
		} `json:"experiments,omitempty"`
	} `json:"spec,omitempty"`
}
