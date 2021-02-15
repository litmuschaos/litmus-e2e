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
	LibImageDefault           string
	LibImageCI                string
	LibImageNew               string
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
