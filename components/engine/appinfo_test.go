package engine

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

func TestAppInfo(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests for appinfo in engine
//The test is performed over pod-delete experiment
//where wrong app info is provided and we test if experiment gets fail
var _ = Describe("BDD of appinfo test", func() {

	// BDD for cleaning all components
	Context("Check for litmus components", func() {

		It("Should delete all the litmus CRs", func() {
			By("[Cleanup]: Removing Litmus Components")
			err := pkg.Cleanup()
			Expect(err).To(BeNil(), "Failed to delete all litmus components due to {%v}", err)

		})

	})

	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			chaosExperiment := v1alpha1.ChaosExperiment{}
			chaosEngine := v1alpha1.ChaosEngine{}

			var err error
			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err = clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			log.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-delete", "appinfo-engine")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed due to {%v}", err)

			// Prepare Chaos Execution
			By("[Prepare]: Prepare Chaos Execution")
			//Providing wrong appinfo

			testsDetails.AppLabel = "run=dummy"
			err = pkg.PrepareChaos(&testsDetails, &chaosExperiment, &chaosEngine, clients, false)
			Expect(err).To(BeNil(), "Failed to prepare chaos due to {%v}", err)

			//Checking runner pod creation
			By("[Status]: Runner pod running status check")
			//setting appns for runner pod status check
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
			chaosResult, err := pkg.GetChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "Failed to get the chaosresult due to {%v}", err)
			Expect(chaosResult).To(Equal("Fail"), "ChaosResult verdict is not set to Fail due to {%v}", err)

		})
	})
	// BDD for checking chaosengine Verdict
	Context("Check for chaos engine verdict", func() {

		It("Should check for the verdict of engine", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			log.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-delete", "appinfo-engine")

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			chaosEngineVerdict, err := pkg.GetChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "Failed to get ChaosEngine Verdict due to, {%v}", err)
			Expect(chaosEngineVerdict).To(Equal("Fail"), "ChaosEngine Verdict is not set to Fail,")

		})
	})
	// // BDD for cleaning all components
	// Context("Cleanup litmus components", func() {

	// 	It("Should delete all the litmus CRs", func() {
	// 		By("[Cleanup]: Removing Litmus Components")
	// 		err := pkg.Cleanup()
	// 		Expect(err).To(BeNil(), "Failed to delete all litmus components due to {%v}", err)

	// 	})
	// })
})
