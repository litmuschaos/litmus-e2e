package tests

import (
	"testing"

	"github.com/litmuschaos/litmus-e2e/pkg"
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	"k8s.io/klog"
)

func TestWithoutAppInfo(t *testing.T) {

	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests for node-cpu-hog without appinfo
var _ = Describe("BDD of node-cpu-hog experiment", func() {

	// BDD for cleaning all components before running the test
	Context("cleanup for litmus components", func() {

		It("Should delete all the litmus CRs", func() {

			By("[Cleanup]: Removing Litmus Components")
			err := pkg.Cleanup()
			if err != nil {
				klog.Info("Fail to delete all litmus components")
			}
		})
	})

	// BDD TEST CASE 1
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig, due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "node-cpu-hog", "node-cpu-engine-without-appinfo")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed, due to {%v}", err)

			//Installing RBAC for the experiment
			By("[Install]: Installing RBAC")
			testsDetails.ChaosNamespace = "default"
			testsDetails.AppNS = "default"
			err = pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install rbac, due to {%v}", err)

			//Installing Chaos Experiment for node-cpu-hog
			By("[Install]: Installing chaos experiment")
			testsDetails.LibImageCI = testsDetails.LibImageNew
			err = pkg.InstallGoChaosExperiment(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install chaos experiment, due to {%v}", err)

			//Installing Chaos Engine for node-cpu-hog
			By("[Install]: Installing chaos engine")
			testsDetails.EnginePath = "https://raw.githubusercontent.com/litmuschaos/litmus-e2e/generic/manifest/without_appinfo/node-cpu-hog.yml"
			testsDetails.JobCleanUpPolicy = "delete"
			err = pkg.InstallGoChaosEngine(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install chaosengine, due to {%v}", err)

			//Checking runner pod running state
			By("[Status]: Runner pod running status check")
			_, err = pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients)
			Expect(err).To(BeNil(), "Runner pod status check failed, due to {%v}", err)

			//Chaos pod running status check
			err = pkg.ChaosPodStatus(&testsDetails, clients)
			Expect(err).To(BeNil(), "Chaos pod status check failed, due to {%v}", err)

			//Waiting for chaos pod to get completed
			//And Print the logs of the chaos pod
			By("[Status]: Wait for chaos pod completion and then print logs")
			err = pkg.ChaosPodLogs(&testsDetails, clients)
			Expect(err).To(BeNil(), "Fail to get the experiment chaos pod logs, due to {%v}", err)

			//Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			_, err = pkg.ChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChasoResult Verdict check failed, due to {%v}", err)

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			err = pkg.ChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)

		})
	})

	// BDD TEST CASE 2
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig, due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "node-memory-hog", "node-memory-engine-without-appinfo")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed, due to {%v}", err)

			//Installing RBAC for the experiment
			By("[Install]: Installing RBAC")
			testsDetails.ChaosNamespace = "default"
			testsDetails.AppNS = "default"
			err = pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install rbac, due to {%v}", err)

			//Installing Chaos Experiment for node-memory-hog
			By("[Install]: Installing chaos experiment")
			testsDetails.LibImageCI = testsDetails.LibImageNew
			err = pkg.InstallGoChaosExperiment(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install chaos experiment, due to {%v}", err)

			//Installing Chaos Engine for node-memory-hog
			By("[Install]: Installing chaos engine")
			testsDetails.EnginePath = "https://raw.githubusercontent.com/litmuschaos/litmus-e2e/generic/manifest/without_appinfo/node-memory-hog.yml"
			testsDetails.JobCleanUpPolicy = "delete"
			err = pkg.InstallGoChaosEngine(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install chaosengine, due to {%v}", err)

			//Checking runner pod running state
			By("[Status]: Runner pod running status check")
			_, err = pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients)
			Expect(err).To(BeNil(), "Runner pod status check failed, due to {%v}", err)

			//Chaos pod running status check
			err = pkg.ChaosPodStatus(&testsDetails, clients)
			Expect(err).To(BeNil(), "Chaos pod status check failed, due to {%v}", err)

			//Waiting for chaos pod to get completed
			//And Print the logs of the chaos pod
			By("[Status]: Wait for chaos pod completion and then print logs")
			err = pkg.ChaosPodLogs(&testsDetails, clients)
			Expect(err).To(BeNil(), "Fail to get the experiment chaos pod logs, due to {%v}", err)

			//Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			_, err = pkg.ChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChasoResult Verdict check failed, due to {%v}", err)

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			err = pkg.ChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)

		})
	})

	// BDD TEST CASE 3
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig, due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "kubelet-service-kill", "ksk-engine-without-appinfo")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed, due to {%v}", err)

			// Getting application node name
			By("[Prepare]: Getting application node name")
			_, err = pkg.GetApplicationNode(&testsDetails, clients)
			Expect(err).To(BeNil(), "Unable to get application node name due to {%v}", err)

			// Getting other node for nodeSelector in engine
			testsDetails.NodeSelectorName, err = pkg.GetSelectorNode(&testsDetails, clients)
			Expect(err).To(BeNil(), "Error in getting node selector name, due to {%v}", err)
			Expect(testsDetails.NodeSelectorName).NotTo(BeEmpty(), "Unable to get node name for node selector, due to {%v}", err)

			//Cordon the application node
			By("Cordoning Application Node")
			err = pkg.NodeCordon(&testsDetails)
			Expect(err).To(BeNil(), "Fail to Cordon the app node, due to {%v}", err)

			//Installing RBAC for the experiment
			By("[Install]: Installing RBAC")
			testsDetails.ChaosNamespace = "default"
			testsDetails.AppNS = "default"
			err = pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install rbac, due to {%v}", err)

			//Installing Chaos Experiment for kubelet-service-kill
			By("[Install]: Installing chaos experiment")
			err = pkg.InstallGoChaosExperiment(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install chaos experiment, due to {%v}", err)

			//Installing Chaos Engine for kubelet-service-kill
			By("[Install]: Installing chaos engine")
			testsDetails.EnginePath = "https://raw.githubusercontent.com/litmuschaos/litmus-e2e/generic/manifest/without_appinfo/kubelet-service-kill.yml"
			testsDetails.JobCleanUpPolicy = "delete"
			err = pkg.InstallGoChaosEngine(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install chaosengine, due to {%v}", err)

			//Checking runner pod running state
			By("[Status]: Runner pod running status check")
			_, err = pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients)
			Expect(err).To(BeNil(), "Runner pod status check failed, due to {%v}", err)

			//Chaos pod running status check
			err = pkg.ChaosPodStatus(&testsDetails, clients)
			Expect(err).To(BeNil(), "Chaos pod status check failed, due to {%v}", err)

			//Waiting for chaos pod to get completed
			//And Print the logs of the chaos pod
			By("[Status]: Wait for chaos pod completion and then print logs")
			err = pkg.ChaosPodLogs(&testsDetails, clients)
			Expect(err).To(BeNil(), "Fail to get the experiment chaos pod logs, due to {%v}", err)

			//Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			_, err = pkg.ChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChasoResult Verdict check failed, due to {%v}", err)

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			err = pkg.ChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)
		})
	})

	//Waiting for experiment job to get completed
	// BDD for uncordoning the application node
	Context("Check for application node", func() {

		It("Should uncordon the app node", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			// Getting application node name
			By("[Prepare]: Getting application node name")
			_, err = pkg.GetApplicationNode(&testsDetails, clients)
			Expect(err).To(BeNil(), "Unable to get application node name due to {%v}", err)

			//Uncordon the application node
			By("Uncordoning Application Node")
			err = pkg.NodeUncordon(&testsDetails)
			Expect(err).To(BeNil(), "Fail to uncordon the app node, due to {%v}", err)

		})
	})

	// BDD TEST CASE 4
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig, due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "node-taint", "node-taint-engine-without-appinfo")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed, due to {%v}", err)

			// Getting application node name
			By("[Prepare]: Getting application node name")
			_, err = pkg.GetApplicationNode(&testsDetails, clients)
			Expect(err).To(BeNil(), "Unable to get application node name due to {%v}", err)

			// Getting other node for nodeSelector in engine
			testsDetails.NodeSelectorName, err = pkg.GetSelectorNode(&testsDetails, clients)
			Expect(err).To(BeNil(), "Error in getting node selector name, due to {%v}", err)
			Expect(testsDetails.NodeSelectorName).NotTo(BeEmpty(), "Unable to get node name for node selector, due to {%v}", err)

			//Cordon the application node
			By("Cordoning Application Node")
			err = pkg.NodeCordon(&testsDetails)
			Expect(err).To(BeNil(), "Fail to Cordon the app node, due to {%v}", err)

			//Installing RBAC for the experiment
			By("[Install]: Installing RBAC")
			testsDetails.ChaosNamespace = "default"
			testsDetails.AppNS = "default"
			err = pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install rbac, due to {%v}", err)

			//Installing Chaos Experiment for node-cordon
			By("[Install]: Installing chaos experiment")
			err = pkg.InstallGoChaosExperiment(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install chaos experiment, due to {%v}", err)

			//Installing Chaos Engine for node-cordon
			By("[Install]: Installing chaos engine")
			testsDetails.EnginePath = "https://raw.githubusercontent.com/litmuschaos/litmus-e2e/generic/manifest/without_appinfo/node-taint.yml"
			testsDetails.JobCleanUpPolicy = "delete"
			err = pkg.InstallGoChaosEngine(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install chaos engine, due to {%v}", err)

			//Checking runner pod running state
			By("[Status]: Runner pod running status check")
			_, err = pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients)
			Expect(err).To(BeNil(), "Runner pod status check failed, due to {%v}", err)

			//Chaos pod running status check
			err = pkg.ChaosPodStatus(&testsDetails, clients)
			Expect(err).To(BeNil(), "Chaos pod status check failed, due to {%v}", err)

			//Waiting for chaos pod to get completed
			//And Print the logs of the chaos pod
			By("[Status]: Wait for chaos pod completion and then print logs")
			err = pkg.ChaosPodLogs(&testsDetails, clients)
			Expect(err).To(BeNil(), "Fail to get the experiment chaos pod logs, due to {%v}", err)

			//Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			_, err = pkg.ChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChasoResult Verdict check failed, due to {%v}", err)

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			err = pkg.ChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)

		})
	})
	// BDD for uncordoning the application node
	Context("Check for application node", func() {

		It("Should uncordon the app node", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			// Getting application node name
			By("[Prepare]: Getting application node name")
			_, err = pkg.GetApplicationNode(&testsDetails, clients)
			Expect(err).To(BeNil(), "Unable to get application node name due to {%v}", err)

			//Uncordon the application node
			By("Uncordoning Application Node")
			err = pkg.NodeUncordon(&testsDetails)
			Expect(err).To(BeNil(), "Fail to uncordon the app node, due to {%v}", err)

		})
	})

	// BDD TEST CASE 5
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig, due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "node-io-stress", "no-io-stress-engine-wo-appinfo")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed, due to {%v}", err)

			//Installing RBAC for the experiment
			testsDetails.ChaosNamespace = "default"
			testsDetails.AppNS = "default"
			By("[Install]: Installing RBAC")
			err = pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install rbac, due to {%v}", err)

			//Installing Chaos Experiment for node-io-stress
			By("[Install]: Installing chaos experiment")
			testsDetails.LibImageCI = testsDetails.LibImageNew
			err = pkg.InstallGoChaosExperiment(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install chaos experiment, due to {%v}", err)

			//Installing Chaos Engine for node-io-stress
			By("[Install]: Installing chaos engine")
			testsDetails.EnginePath = "https://raw.githubusercontent.com/litmuschaos/litmus-e2e/generic/manifest/without_appinfo/node-io-stress.yml"
			testsDetails.JobCleanUpPolicy = "delete"
			err = pkg.InstallGoChaosEngine(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install chaosengine, due to {%v}", err)

			//Checking runner pod running state
			By("[Status]: Runner pod running status check")
			_, err = pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients)
			Expect(err).To(BeNil(), "Runner pod status check failed, due to {%v}", err)

			//Chaos pod running status check
			err = pkg.ChaosPodStatus(&testsDetails, clients)
			Expect(err).To(BeNil(), "Chaos pod status check failed, due to {%v}", err)

			//Waiting for chaos pod to get completed
			//And Print the logs of the chaos pod
			By("[Status]: Wait for chaos pod completion and then print logs")
			err = pkg.ChaosPodLogs(&testsDetails, clients)
			Expect(err).To(BeNil(), "Fail to get the experiment chaos pod logs, due to {%v}", err)

			//Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			_, err = pkg.ChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChasoResult Verdict check failed, due to {%v}", err)

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			err = pkg.ChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)

		})
	})
})
