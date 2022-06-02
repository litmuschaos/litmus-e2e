package tests

import (
	"fmt"
	"testing"

	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus-e2e/pkg"
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/litmuschaos/litmus-e2e/utils"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	"k8s.io/klog"
)

func TestGoNodeSelector(t *testing.T) {

	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

var _ = Describe("BDD of Node selector", func() {
	Context("Test for target node selection by node name", func() {
		It("Execute the node-cpu-hog experiment using a valid TARGET_NODES value", func() {
			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			chaosEngine := v1alpha1.ChaosEngine{}
			chaosExperiment := v1alpha1.ChaosExperiment{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			environment.GetENV(&testsDetails, "node-cpu-hog", "node-selector-engine")
			klog.Infof("[PreReq]: Fetched the ENVs for the %v test", testsDetails.ExperimentName)

			//Setting random node as the target node
			nodeDetails, err := pkg.GetRandomNode(clients)
			Expect(err).To(BeNil(), "Failed to fetch random node due to {%v}", err)
			testsDetails.TargetNodes = nodeDetails.Name

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed due to {%v}", err)

			// Prepare Chaos Execution
			By("[Prepare]: Prepare Chaos Execution")
			err = pkg.PrepareChaos(&testsDetails, &chaosExperiment, &chaosEngine, clients, false)
			Expect(err).To(BeNil(), "Failed to prepare chaos due to {%v}", err)

			//Checking runner pod running state
			By("[Status]: Runner pod running status check")
			err = pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients)
			Expect(err).To(BeNil(), "Runner pod status check failed due to {%v}", err)

			//Chaos pod running status check
			err = pkg.ChaosPodStatus(&testsDetails, clients)
			Expect(err).To(BeNil(), "Chaos pod status check failed due to {%v}", err)

			// Waiting for chaos pod to get completed
			// And Print the logs of the chaos pod
			By("[Status]: Wait for chaos pod completion and then print logs")
			err = pkg.ChaosPodLogs(&testsDetails, clients)
			Expect(err).To(BeNil(), "Failed to get the experiment chaos pod logs due to {%v}", err)

			// Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			err = pkg.ChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosResult Verdict check failed due to {%v}", err)

			// Validate if the target node name is present in the chaos result
			err = pkg.ValidateNodeName(nodeDetails.Name, clients, &testsDetails)
			Expect(err).To(BeNil(), "ChaosResult Verdict check failed due to {%v}", err)

			// Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			err = pkg.ChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed due to {%v}", err)
		})

		It("Execute the node-cpu-hog experiment using an invalid TARGET_NODES value", func() {
			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			chaosEngine := v1alpha1.ChaosEngine{}
			chaosExperiment := v1alpha1.ChaosExperiment{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			environment.GetENV(&testsDetails, "node-cpu-hog", "node-selector-engine-1")
			klog.Infof("[PreReq]: Fetched the ENVs for the %v test", testsDetails.ExperimentName)

			// Set incorrect target node string
			testsDetails.TargetNodes = utils.GetRandomString(20)

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed due to {%v}", err)

			// Prepare Chaos Execution
			By("[Prepare]: Prepare Chaos Execution")
			err = pkg.PrepareChaos(&testsDetails, &chaosExperiment, &chaosEngine, clients, false)
			Expect(err).To(BeNil(), "Failed to prepare chaos due to {%v}", err)

			//Checking runner pod running state
			By("[Status]: Runner pod running status check")
			err = pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients)
			Expect(err).To(BeNil(), "Runner pod status check failed due to {%v}", err)

			// Chaos pod running status check
			err = pkg.ChaosPodStatus(&testsDetails, clients)
			Expect(err).To(BeNil(), "Chaos pod status check failed due to {%v}", err)

			// Waiting for chaos pod to get completed
			// And Print the logs of the chaos pod
			By("[Status]: Wait for chaos pod completion and then print logs")
			err = pkg.ChaosPodLogs(&testsDetails, clients)
			Expect(err).To(BeNil(), "Failed to get the experiment chaos pod logs due to {%v}", err)

			// Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			chaosResult, err := pkg.GetChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChasoResult Verdict check failed due to {%v}", err)
			Expect(chaosResult).To(Equal("Fail"), "ChaosResult verdict is not set to Fail due to {%v}", err)

			// Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			chaosEngineVerdict, err := pkg.GetChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed due to {%v}", err)
			Expect(chaosEngineVerdict).To(Equal("Fail"), "ChaosEngine Verdict is not set to Fail due to {%v}", err)
		})
	})

	Context("Test for target node selection by node label", func() {
		It("Executes the node-cpu-hog experiment using a valid NODE_LABEL value", func() {
			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			chaosEngine := v1alpha1.ChaosEngine{}
			chaosExperiment := v1alpha1.ChaosExperiment{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			environment.GetENV(&testsDetails, "node-cpu-hog", "node-selector-engine-2")
			klog.Infof("[PreReq]: Fetched the ENVs for the %v test", testsDetails.ExperimentName)

			//Deriving node label of a random node and assigning it to the NodeLabel
			nodeDetails, err := pkg.GetRandomNode(clients)
			Expect(err).To(BeNil(), "Failed to fetch random node due to {%v}", err)
			for key, value := range nodeDetails.Labels {
				testsDetails.NodeLabel = key + "=" + value
				break
			}

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed due to {%v}", err)

			// Prepare Chaos Execution
			By("[Prepare]: Prepare Chaos Execution")
			err = pkg.PrepareChaos(&testsDetails, &chaosExperiment, &chaosEngine, clients, false)
			Expect(err).To(BeNil(), "Failed to prepare chaos due to {%v}", err)

			//Checking runner pod running state
			By("[Status]: Runner pod running status check")
			err = pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients)
			Expect(err).To(BeNil(), "Runner pod status check failed due to {%v}", err)

			//Chaos pod running status check
			err = pkg.ChaosPodStatus(&testsDetails, clients)
			Expect(err).To(BeNil(), "Chaos pod status check failed due to {%v}", err)

			// Waiting for chaos pod to get completed
			// And Print the logs of the chaos pod
			By("[Status]: Wait for chaos pod completion and then print logs")
			err = pkg.ChaosPodLogs(&testsDetails, clients)
			Expect(err).To(BeNil(), "Failed to get the experiment chaos pod logs due to {%v}", err)

			// Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			err = pkg.ChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChasoResult Verdict check failed due to {%v}", err)

			// Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			err = pkg.ChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed due to {%v}", err)
		})

		It("Should execute the node-cpu-hog experiment using an invalid NODE_LABEL value", func() {
			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			chaosEngine := v1alpha1.ChaosEngine{}
			chaosExperiment := v1alpha1.ChaosExperiment{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			environment.GetENV(&testsDetails, "node-cpu-hog", "node-selector-engine-3")
			klog.Infof("[PreReq]: Fetched the ENVs for the %v test", testsDetails.ExperimentName)

			// Set an incorrect NodeLabel
			testsDetails.NodeLabel = fmt.Sprintf("%s=%s", utils.GetRandomString(5), utils.GetRandomString(20))

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed due to {%v}", err)

			// Prepare Chaos Execution
			By("[Prepare]: Prepare Chaos Execution")
			err = pkg.PrepareChaos(&testsDetails, &chaosExperiment, &chaosEngine, clients, false)
			Expect(err).To(BeNil(), "Failed to prepare chaos due to {%v}", err)

			//Checking runner pod running state
			By("[Status]: Runner pod running status check")
			err = pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients)
			Expect(err).To(BeNil(), "Runner pod status check failed due to {%v}", err)

			// Chaos pod running status check
			err = pkg.ChaosPodStatus(&testsDetails, clients)
			Expect(err).To(BeNil(), "Chaos pod status check failed due to {%v}", err)

			// Waiting for chaos pod to get completed
			// And Print the logs of the chaos pod
			By("[Status]: Wait for chaos pod completion and then print logs")
			err = pkg.ChaosPodLogs(&testsDetails, clients)
			Expect(err).To(BeNil(), "Failed to get the experiment chaos pod logs due to {%v}", err)

			// Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			chaosResult, err := pkg.GetChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChasoResult Verdict check failed due to {%v}", err)
			Expect(chaosResult).To(Equal("Fail"), "ChaosResult verdict is not set to Fail due to {%v}", err)

			// Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			chaosEngineVerdict, err := pkg.GetChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed due to {%v}", err)
			Expect(chaosEngineVerdict).To(Equal("Fail"), "ChaosEngine Verdict is not set to Fail due to {%v}", err)
		})
	})

	Context("Test for target node selection when neither NODE_LABEL nor TARGET_NODES is provided", func() {
		It("Executes the node-cpu-hog experiment without TARGET_NODES and NODE_LABEL", func() {
			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			chaosEngine := v1alpha1.ChaosEngine{}
			chaosExperiment := v1alpha1.ChaosExperiment{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			environment.GetENV(&testsDetails, "node-cpu-hog", "node-selector-engine-4")
			klog.Infof("[PreReq]: Fetched the ENVs for the %v test", testsDetails.ExperimentName)

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed due to {%v}", err)

			// Prepare Chaos Execution
			By("[Prepare]: Prepare Chaos Execution")
			err = pkg.PrepareChaos(&testsDetails, &chaosExperiment, &chaosEngine, clients, false)
			Expect(err).To(BeNil(), "Failed to prepare chaos due to {%v}", err)

			//Checking runner pod running state
			By("[Status]: Runner pod running status check")
			err = pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients)
			Expect(err).To(BeNil(), "Runner pod status check failed due to {%v}", err)

			//Chaos pod running status check
			err = pkg.ChaosPodStatus(&testsDetails, clients)
			Expect(err).To(BeNil(), "Chaos pod status check failed due to {%v}", err)

			// Waiting for chaos pod to get completed
			// And Print the logs of the chaos pod
			By("[Status]: Wait for chaos pod completion and then print logs")
			err = pkg.ChaosPodLogs(&testsDetails, clients)
			Expect(err).To(BeNil(), "Failed to get the experiment chaos pod logs due to {%v}", err)

			// Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			err = pkg.ChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChasoResult Verdict check failed due to {%v}", err)

			// Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			err = pkg.ChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed due to {%v}", err)
		})
	})
})
