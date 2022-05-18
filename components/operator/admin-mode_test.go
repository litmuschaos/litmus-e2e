package operator

import (
	"testing"

	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus-e2e/pkg"
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/log"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
)

func TestAdminModeTest(t *testing.T) {

	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests for testing admin mode functionality
//Checking for the creation of runner pod for application in same namespace
var _ = Describe("BDD of operator reconcile resiliency check", func() {

	// BDD TEST CASE 1
	// All Litmus components are in litmus namespace and application pod is in defalt ns
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			chaosExperiment := v1alpha1.ChaosExperiment{}
			chaosEngine := v1alpha1.ChaosEngine{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			log.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-delete", "adminengine")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed due to {%v}", err)

			//Creating application for pod-delete in default namespace
			By("Creating deployment for pod-delete chaos")
			err = pkg.CreateDeployment(clients, "adminapp", "nginx:1.12", "default")
			Expect(err).To(BeNil(), "Deployment adminapp failed to create due to {%v}", err)

			//Waiting for deployment to get ready
			err = pkg.DeploymentStatusCheck(&testsDetails, "adminapp", "default", clients)
			Expect(err).To(BeNil(), "Error Timeout, {%v}", err)

			testsDetails.AppNS = "default"
			testsDetails.AppLabel = "run=adminapp"

			//Installing admin RBAC for the chaos
			By("[Install]: Installing RBAC for pod-delete")
			err = pkg.InstallAdminRbac(&testsDetails)
			Expect(err).To(BeNil(), "Failed to install rbac due to {%v}", err)

			//Installing Chaos Experiment for pod-delete
			By("[Install]: Installing pod-delete chaos experiment")
			err = pkg.InstallGoChaosExperiment(&testsDetails, &chaosExperiment, testsDetails.ChaosNamespace, clients)
			Expect(err).To(BeNil(), "Failed to install chaos experiment due to {%v}", err)

			//Installing Chaos Engine for container-kill
			By("[Install]: Installing chaos engine")
			testsDetails.ChaosServiceAccount = "litmus-admin"
			err = pkg.InstallGoChaosEngine(&testsDetails, &chaosEngine, testsDetails.ChaosNamespace, clients)
			Expect(err).To(BeNil(), "Failed to install chaosengine due to {%v}", err)

			//Checking runner pod running state
			testsDetails.AppNS = "litmus"
			By("[Status]: Runner pod running status check")
			err = pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients)
			Expect(err).To(BeNil(), "Runner pod status check failed due to {%v}", err)

			//Chaos pod running status check
			err = pkg.ChaosPodStatus(&testsDetails, clients)
			Expect(err).To(BeNil(), "Chaos pod status check failed due to {%v}", err)

			//Waiting for chaos pod to get completed
			//And Print the logs of the chaos pod
			By("[Status]: Wait for chaos pod completion and then print logs")
			err = pkg.ChaosPodLogs(&testsDetails, clients)
			Expect(err).To(BeNil(), "Failed to get the experiment chaos pod logs due to {%v}", err)

			//Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			err = pkg.ChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChasoResult Verdict check failed due to {%v}", err)

		})
	})
	// BDD TEST CASE 2
	// Operator in litmus ns, engine and experiment is in test ns
	// Application is in deafult ns
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {
			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			chaosExperiment := v1alpha1.ChaosExperiment{}
			chaosEngine := v1alpha1.ChaosEngine{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			log.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-delete", "adminengine")

			//Create Namespace for the test
			By("Creating namespace")
			err = pkg.CreateNamespace(clients, "test")
			Expect(err).To(BeNil(), "Namespace creation failed due to {%v}", err)

			testsDetails.ChaosNamespace = "test"
			testsDetails.AppNS = "default"
			testsDetails.AppLabel = "run=adminapp"
			//Installing admin RBAC for the chaos
			By("[Install]: Installing RBAC")
			err = pkg.InstallAdminRbac(&testsDetails)
			Expect(err).To(BeNil(), "Failed to create namespace due to {%v}", err)

			//Installing Chaos Experiment for pod-delete
			By("[Install]: Installing pod-delete chaos experiment")
			err = pkg.InstallGoChaosExperiment(&testsDetails, &chaosExperiment, testsDetails.ChaosNamespace, clients)
			Expect(err).To(BeNil(), "Failed to install chaos experiment due to {%v}", err)

			//Installing Chaos Engine for container-kill
			By("[Install]: Installing chaos engine")
			testsDetails.ChaosServiceAccount = "litmus-admin"
			err = pkg.InstallGoChaosEngine(&testsDetails, &chaosEngine, testsDetails.ChaosNamespace, clients)
			Expect(err).To(BeNil(), "Failed to install chaos experiment due to {%v}", err)

			//Checking runner pod running state
			testsDetails.AppNS = "test"
			By("[Status]: Runner pod running status check")
			err = pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients)
			Expect(err).To(BeNil(), "Unable to check the runner pod status due to {%v}", err)

			//Chaos pod running status check
			err = pkg.ChaosPodStatus(&testsDetails, clients)
			Expect(err).To(BeNil(), "Chaos pod status check failed due to {%v}", err)

			//Waiting for chaos pod to get completed
			//And Print the logs of the chaos pod
			By("[Status]: Wait for chaos pod completion and then print logs")
			err = pkg.ChaosPodLogs(&testsDetails, clients)
			Expect(err).To(BeNil(), "Failed to get the experiment chaos pod logs due to {%v}", err)

			//Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			err = pkg.ChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChasoResult Verdict check failed due to {%v}", err)
		})
	})

})
