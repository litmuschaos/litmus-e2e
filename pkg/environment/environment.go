package environment

import (
	"os"
	"strconv"

	types "github.com/litmuschaos/litmus-e2e/pkg/types"
)

//GetENV fetches all the env variables from the runner pod
func GetENV(testDetails *types.TestDetails, expName, engineName string) {
	testDetails.ExperimentName = expName
	testDetails.EngineName = engineName
	testDetails.OperatorName = Getenv("OPERATOR_NAME", "chaos-operator-ce")
	testDetails.ChaosNamespace = Getenv("CHAOS_NAMESPACE", "litmus")
	testDetails.AppNS = Getenv("APP_NS", "litmus")
	testDetails.AppLabel = Getenv("APP_LABEL", "run=nginx")
	testDetails.JobCleanUpPolicy = Getenv("JOB_CLEANUP_POLICY", "retain")
	testDetails.AnnotationCheck = Getenv("ANNOTATION_CHECK", "false")
	testDetails.ApplicationNodeName = Getenv("APPLICATION_NODE_NAME", "")
	testDetails.NodeSelectorName = Getenv("APPLICATION_NODE_NAME", "")
	testDetails.ImagePullPolicy = Getenv("IMAGE_PULL_POLICY", "Always")
	testDetails.ExperimentImagePullPolicy = Getenv("EXPERIMENT_IMAGE_PULL_POLICY", "Always")
	testDetails.ChaosDuration, _ = strconv.Atoi(Getenv("TOTAL_CHAOS_DURATION", ""))
	testDetails.ChaosServiceAccount = Getenv("CHAOS_SERVICE_ACCOUNT", "")
	testDetails.NewExperimentName = Getenv("NEW_EXPERIMENT_NAME", expName)
	testDetails.Delay, _ = strconv.Atoi(Getenv("DELAY", "5"))
	testDetails.Duration, _ = strconv.Atoi(Getenv("DURATION", "180"))
	testDetails.FillPercentage, _ = strconv.Atoi(Getenv("FILL_PERCENTAGE", "20"))
	testDetails.CPUKillCommand = Getenv("CPU_KILL_COMMAND", "kill -9 $(ps afx | grep \"[md5sum] /dev/zero\" | awk '{print$1}' | tr '\\n' ' ')")
	testDetails.MemoryKillCommand = Getenv("MEMORY_KILL_COMMAND", "kill -9 $(ps afx | grep \"[dd] if /dev/zero\" | awk '{print$1}' | tr '\\n' ' ')")
	testDetails.InstanceID = Getenv("EC2_INSTANCE_ID", "")
	testDetails.InstanceTag = Getenv("EC2_INSTANCE_TAG", "")
	testDetails.EBSVolumeID = Getenv("EBS_VOLUME_ID", "")
	testDetails.EBSVolumeTag = Getenv("EBS_VOLUME_TAG", "")
	testDetails.VMInstanceNames = Getenv("VM_INSTANCE_NAMES", "")
	testDetails.GCPProjectID = Getenv("GCP_PROJECT_ID", "")
	testDetails.InstanceZones = Getenv("INSTANCE_ZONES", "")
	testDetails.DiskVolumeNames = Getenv("DISK_VOLUME_NAMES", "")
	testDetails.DiskZones = Getenv("DISK_ZONES", "")
	testDetails.DeviceNames = Getenv("DEVICE_NAMES", "")
	testDetails.VMIds = Getenv("APP_VM_MOIDS", "")
	testDetails.Region = Getenv("REGION", "us-west-1")
	testDetails.UpdateWebsite = Getenv("UPDATE_WEBSITE", "false")
	testDetails.TargetNodes = Getenv("TARGET_NODES", "")
	testDetails.NodeLabel = Getenv("NODE_LABEL", "")
	testDetails.AzureResourceGroup = Getenv("AZURE_RESOURCE_GROUP", "")
	testDetails.AzureInstanceName = Getenv("AZURE_INSTANCE_NAME", "")
	testDetails.AzureDiskName = Getenv("AZURE_DISK_NAME", "")
	testDetails.AzureScaleSet = Getenv("AZURE_SCALE_SET", "")
	testDetails.Args = Getenv("ARGS", "")
	testDetails.Command = Getenv("COMMAND", "")

	//All Images for running chaos test
	testDetails.AnsibleExperimentImage = Getenv("ANSIBLE_EXPERIMENT_IMAGE", "litmuschaos/ansible-runner:ci")
	testDetails.ExperimentImage = Getenv("EXPERIMENT_IMAGE", "litmuschaos/go-runner:ci")
	testDetails.OperatorImage = Getenv("OPERATOR_IMAGE", "litmuschaos/chaos-operator:ci")
	testDetails.RunnerImage = Getenv("RUNNER_IMAGE", "litmuschaos/chaos-runner:ci")
	testDetails.LibImage = Getenv("LIB_IMAGE", "")

	// All Links for running chaos testing
	testDetails.RbacPath = Getenv("RBAC_PATH", "https://hub.litmuschaos.io/api/chaos/master?file=charts/generic/"+expName+"/rbac.yaml")
	testDetails.ExperimentPath = Getenv("EXPERIMENT_PATH", "https://hub.litmuschaos.io/api/chaos/master?file=charts/generic/"+expName+"/experiment.yaml")
	testDetails.EnginePath = Getenv("ENGINE_PATH", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/"+expName+"/engine.yaml")
	testDetails.AnsibleRbacPath = Getenv("ANSIBLE_RBAC_PATH", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/"+expName+"/ansible/rbac.yaml")
	testDetails.AnsibleExperimentPath = Getenv("ANSIBLE_EXPERIMENT_PATH", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/"+expName+"/ansible/experiment.yaml")
	testDetails.AnsibleEnginePath = Getenv("ANSIBLE_ENGINE_PATH", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/"+expName+"/ansible/engine.yaml")
	testDetails.InstallLitmus = Getenv("INSTALL_LITMUS", "https://litmuschaos.github.io/litmus/litmus-operator-latest.yaml")
	testDetails.AdminRbacPath = Getenv("ADMIN_RBAC_PATH", "https://litmuschaos.github.io/litmus/litmus-admin-rbac.yaml")

	// Portal Envs
	testDetails.Version = Getenv("RUN_VERSION", "ci")
}

// Getenv fetch the env and set the default value, if any
func Getenv(key string, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		value = defaultValue
	}
	return value
}
