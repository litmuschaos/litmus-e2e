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

func TestExperimentName(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests for experiment-name in engine
//The test is performed over pod-delete experiment
//where wrong experiment name is provided and we test if experiment gets fail
var _ = Describe("BDD of experiment name test", func() {

	// BDD TEST CASE 1
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
			environment.GetENV(&testsDetails, "pod-delete", "experiment-name-engine")

			// Prepare Chaos Execution
			By("[Prepare]: Prepare Chaos Execution")
			//Providing wrong experiment-name
			testsDetails.NewExperimentName = "dummy-name"
			err = pkg.PrepareChaos(&testsDetails, &chaosExperiment, &chaosEngine, clients, false)
			Expect(err).To(BeNil(), "Failed to prepare chaos due to {%v}", err)

			//Checking runner pod creation
			//Runner pod will come in completed state and experiment pod will not be created at all
			//Waiting for runner pod completion
			err = pkg.WaitForRunnerCompletion(&testsDetails, clients)
			Expect(err).To(BeNil(), "Runner pod dosen't come in completed state due to {%v}", err)

			//Chaos pod running status check
			err = pkg.ChaosPodStatus(&testsDetails, clients)
			Expect(err).NotTo(BeNil(), "[TEST FAILED]: Chaos pod created when the experiment name is invalid")

			//Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			_, err = pkg.GetChaosResultVerdict(&testsDetails, clients)
			Expect(err).NotTo(BeNil(), "[TEST FAILED]: ChaosResult created when the experiment name is invalid")

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
			environment.GetENV(&testsDetails, "pod-delete", "experiment-name-engine")

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			chaosEngineVerdict, err := pkg.GetChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "Failed to get the ChaosEngine Verdict due to {%v}", err)
			Expect(chaosEngineVerdict).To(Equal("Fail"), "ChaosEngine Verdict is not Stopped due to {%v}", err)

		})
	})
	// BDD for cleaning all components
	Context("Cleanup litmus components", func() {

		It("Should delete all the litmus CRs", func() {
			By("[Cleanup]: Removing Litmus Components")
			err := pkg.Cleanup()
			Expect(err).To(BeNil(), "Failed to delete all litmus components due to {%v}", err)

		})

	})
})
