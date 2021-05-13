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

func TestWithAppInfo(t *testing.T) {

	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests for node-cpu-hog with appinfo
var _ = Describe("BDDs to check the node level experiments with appinfo", func() {

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
	Context("Check for kubelet service kill experiment with appinfo", func() {

		It("Should check for creation of runner pod", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			chaosExperiment := types.ChaosExperiment{}
			chaosEngine := types.ChaosEngine{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig, due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "node-taint", "node-taint-engine-with-appinfo")

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

			// Prepare Chaos Execution
			By("[Prepare]: Prepare Chaos Execution")
			testsDetails.AppLabel = "run=nginx"
			testsDetails.EnginePath = "https://raw.githubusercontent.com/litmuschaos/litmus-e2e/generic/manifest/with_appinfo/node-taint.yml"
			testsDetails.JobCleanUpPolicy = "retain"
			err = pkg.PrepareChaos(&testsDetails, &chaosExperiment, &chaosEngine, clients, false)
			Expect(err).To(BeNil(), "fail to prepare chaos, due to {%v}", err)

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
			err = pkg.ChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChasoResult Verdict check failed, due to {%v}", err)

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			err = pkg.ChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)
		})
	})

	//Waiting for experiment job to get completed
	// BDD for uncordoning the application node
	Context("Check to uncordon the target node", func() {

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
})
