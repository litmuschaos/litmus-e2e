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
	testDetails.JobCleanUpPolicy = Getenv("JOB_CLEANUP_POLICY", "'retain'")
	testDetails.AnnotationCheck = Getenv("ANNOTATION_CHECK", "false")
	testDetails.ApplicationNodeName = Getenv("APPLICATION_NODE_NAME", "")
	testDetails.NodeSelectorName = Getenv("APPLICATION_NODE_NAME", "")
	testDetails.ImagePullPolicy = Getenv("IMAGE_PULL_POLICY", "Always")
	testDetails.ChaosDuration, _ = strconv.Atoi(Getenv("TOTAL_CHAOS_DURATION", ""))
	testDetails.ChaosServiceAccount = Getenv("CHAOS_SERVICE_ACCOUNT", expName+"-sa")
	testDetails.NewExperimentName = Getenv("NEW_EXPERIMENT_NAME", expName)
	testDetails.Delay, _ = strconv.Atoi(Getenv("DELAY", "5"))
	testDetails.Duration, _ = strconv.Atoi(Getenv("DURATION", "90"))

	//All Images for running chaos test
	testDetails.AnsibleExperimentImage = Getenv("ANSIBLE_EXPERIMENT_IMAGE", "litmuschaos/ansible-runner:ci")
	testDetails.GoExperimentImage = Getenv("GO_EXPERIMENT_IMAGE", "litmuschaos/go-runner:ci")
	testDetails.OperatorImage = Getenv("OPERATOR_IMAGE", "litmuschaos/chaos-operator:ci")
	testDetails.RunnerImage = Getenv("RUNNER_IMAGE", "litmuschaos/chaos-runner:ci")

	// All Links for running chaos testing
	testDetails.RbacPath = Getenv("RBAC_PATH", "https://hub.litmuschaos.io/api/chaos/master?file=charts/generic/"+expName+"/rbac.yaml")
	testDetails.ExperimentPath = Getenv("EXPERIMENT_PATH", "https://hub.litmuschaos.io/api/chaos/master?file=charts/generic/"+expName+"/experiment.yaml")
	testDetails.EnginePath = Getenv("ENGINE_PATH", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/"+expName+"/engine.yaml")
	testDetails.AnsibleRbacPath = Getenv("ANSIBLE_RBAC_PATH", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/"+expName+"/ansible/rbac.yaml")
	testDetails.AnsibleExperimentPath = Getenv("ANSIBLE_EXPERIMENT_PATH", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/"+expName+"/ansible/experiment.yaml")
	testDetails.AnsibleEnginePath = Getenv("ANSIBLE_ENGINE_PATH", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/"+expName+"/ansible/engine.yaml")
	testDetails.InstallLitmus = Getenv("INSTALL_LITMUS", "https://litmuschaos.github.io/litmus/litmus-operator-latest.yaml")
	testDetails.AdminRbacPath = Getenv("ADMIN_RBAC_PATH", "https://litmuschaos.github.io/litmus/litmus-admin-rbac.yaml")

}

// Getenv fetch the env and set the default value, if any
func Getenv(key string, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		value = defaultValue
	}
	return value
}
