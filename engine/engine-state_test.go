package engine

import (
	"testing"
	"time"

	"github.com/litmuschaos/litmus-e2e/pkg"
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	"k8s.io/klog"
)

func TestEngineState(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests for engine-state in engine
//The test is performed over pod-cpu-hog experiment
var _ = Describe("BDD of engine-state test", func() {

	// BDD TEST CASE 1
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			var err error
			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err = clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-cpu-hog", "engine-state")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed, due to {%v}", err)

			//Installing RBAC for the engine-state test
			By("[Install]: Installing RBAC")
			err = pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install rbac, due to {%v}", err)

			//Installing Chaos Experiment for pod-cpu-hog
			By("[Install]: Installing chaos experiment")
			err = pkg.InstallGoChaosExperiment(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install chaos experiment, due to {%v}", err)

			//Installing Chaos Engine for pod-cpu-hog
			By("[Install]: Installing chaos engine")
			//Providing wrong engine-state
			err = pkg.InstallGoChaosEngine(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install chaos engine, due to {%v}", err)

			//Checking runner pod creation
			By("[Status]: Runner pod running status check")
			_, err = pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients)
			Expect(err).To(BeNil(), "Runner pod status check failed, due to {%v}", err)

			//Chaos pod running status check
			err = pkg.ChaosPodStatus(&testsDetails, clients)
			Expect(err).To(BeNil(), "Chaos pod status check failed, due to {%v}", err)

			//Waiting for chaosresult creation from experiment
			klog.Info("[Wait]: waiting for chaosresult creation from experiment")
			time.Sleep(15 * time.Second)

			//Abort the chaos experiment
			By("[Abort]: Abort the chaos by patching engine state")
			err = pkg.ChaosAbort(&testsDetails)
			Expect(err).To(BeNil(), "[Abort]: Chaos abort failed, due to {%v}", err)

			//Waiting for chaos pod to get completed
			//And Print the logs of the chaos pod
			//The chaos pod logs should not get printed
			By("[Status]: Wait for chaos pod completion and then print logs")
			err = pkg.ChaosPodLogs(&testsDetails, clients)
			Expect(err).NotTo(BeNil(), "[TEST FAILED]: Unable to remove chaos pod after abort")

			//Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			chaosResult, err := pkg.GetChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "Fail to get the chaosresult Verdict, due to {%v}", err)
			Expect(chaosResult).To(Equal("Stopped"), "ChasoResult Verdict is not Stopped, due to {%v}", err)

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
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-cpu-hog", "engine-state")

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			chaosEngineVerdict, err := pkg.GetChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "Fail to get the chaosengine Verdict, due to {%v}", err)
			Expect(chaosEngineVerdict).To(Equal("Stopped"), "ChaosEngine Verdict is not Stopped, due to {%v}", err)

		})
	})
	// BDD for cleaning all components
	Context("Cleanup litmus components", func() {

		It("Should delete all the litmus CRs", func() {
			By("[Cleanup]: Removing Litmus Components")
			err := pkg.Cleanup()
			Expect(err).To(BeNil(), "Fail to delete all litmus components, due to {%v}", err)

		})

	})
})