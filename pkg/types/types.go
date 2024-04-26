package types

const (
	SetupAppInfoIfEmpty    = true
	SetupAppInfoIfNotEmpty = false
)

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
	Appkind                   string
	JobCleanUpPolicy          string
	AnnotationCheck           string
	ApplicationNodeName       string
	ExperimentImage           string
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
	InstanceTag               string
	EBSVolumeID               string
	EBSVolumeTag              string
	VMInstanceNames           string
	GCPProjectID              string
	InstanceZones             string
	DiskVolumeNames           string
	DiskZones                 string
	DeviceNames               string
	VMIds                     string
	Region                    string
	Lib                       string
	PodsAffectedPercentage    string
	Sequence                  string
	Version                   string
	TargetNodes               string
	NodeLabel                 string
	AzureResourceGroup        string
	AzureInstanceName         string
	AzureDiskName             string
	AzureScaleSet             string
	ProcessIds                string
	Args                      string
	Command                   string
}

