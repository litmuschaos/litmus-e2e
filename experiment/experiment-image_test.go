package experiment

import (
	"log"
	"testing"

	"github.com/litmuschaos/litmus-e2e/pkg"
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	"k8s.io/klog"
)

func TestExperimentImage(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests for experiment-image in engine
//The test is performed over pod-delete experiment
//where wrong experiment image is provided and we test if experiment gets fail
var _ = Describe("BDD of experiment image test", func() {

	// BDD TEST CASE 1
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			if err := clients.GenerateClientSetFromKubeConfig(); err != nil {
				klog.Infof("Unable to Get the kubeconfig due to %v", err)
			}

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-delete", "experiment-image-engine")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			if err := pkg.OperatorStatusCheck(&testsDetails, clients); err != nil {
				log.Fatalf("Operator status check failed, due to %v", err)
			}

			//Installing RBAC for the experiment-image test
			By("[Install]: Installing RBAC")
			if err := pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace); err != nil {
				log.Fatalf("Fail to install rbac, due to %v", err)
			}

			//Installing Chaos Experiment for pod-delete
			By("[Install]: Installing chaos experiment")
			testsDetails.GoExperimentImage = "litmuschaos/dummy-image:v1"
			if err := pkg.InstallGoChaosExperiment(&testsDetails, testsDetails.ChaosNamespace); err != nil {
				log.Fatalf("Fail to install chaos experiment, due to %v", err)
			}

			//Installing Chaos Engine for pod-delete
			By("[Install]: Installing chaos engine")
			//Providing wrong experiment-image
			if err := pkg.InstallGoChaosEngine(&testsDetails, testsDetails.ChaosNamespace); err != nil {
				log.Fatalf("Fail to install chaos engine, due to %v", err)
			}

			//Checking runner pod creation
			By("[Status]: Runner pod running status check")
			//setting appns for runner pod status check
			if _, err := pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients); err != nil {
				log.Fatalf("Runner pod status check failed, due to %v", err)
			}

			//Waiting for experiment job to get completed
			//And Print the logs of the job pod (chaos pod)
			By("[Status]: Wait for job completion and then print logs")
			if _, err := pkg.JobLogs(&testsDetails, testsDetails.AppNS, clients); err == nil {
				log.Fatalf("[TEST FAILED]: Experiment comes in running state for invalid image")
			}

			//Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			if _, err := pkg.GetChaosResultVerdict(&testsDetails, clients); err == nil {
				log.Fatalf("[TEST FAILED]: ChasoResult created")
			}

		})
	})
	// BDD for checking chaosengine Verdict
	Context("Check for chaos engine verdict", func() {

		It("Should check for the verdict of engine", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			if err := clients.GenerateClientSetFromKubeConfig(); err != nil {
				log.Fatalf("Unable to Get the kubeconfig due to %v", err)
			}

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-delete", "experiment-image-engine")

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			if chaosEngineVerdict, err := pkg.GetChaosEngineVerdict(&testsDetails, clients); err != nil {
				log.Fatalf("Fail to get ChaosEngine Verdict due to, %v", err)
			} else if chaosEngineVerdict != "Awaited" {
				log.Fatalf("ChaosEngine Verdict is not Awaited")
			}

		})
	})
	// BDD for cleaning all components
	Context("Check for litmus components", func() {

		It("Should delete all the litmus CRs", func() {

			By("[Cleanup]: Removing Litmus Components")
			if err := pkg.Cleanup(); err != nil {
				log.Fatalf("Fail to delete all litmus components, due to %v", err)
			}

		})
	})
})
