package engine

import (
	"log"
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

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			if err := clients.GenerateClientSetFromKubeConfig(); err != nil {
				klog.Infof("Unable to Get the kubeconfig due to %v", err)
			}

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-cpu-hog", "engine-state")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			if err := pkg.OperatorStatusCheck(&testsDetails, clients); err != nil {
				log.Fatalf("Operator status check failed, due to %v", err)
			}

			//Installing RBAC for the engine-state test
			By("[Install]: Installing RBAC")
			if err := pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace); err != nil {
				log.Fatalf("Fail to install rbac, due to %v", err)
			}

			//Installing Chaos Experiment for pod-cpu-hog
			By("[Install]: Installing chaos experiment")
			if err := pkg.InstallGoChaosExperiment(&testsDetails, testsDetails.ChaosNamespace); err != nil {
				log.Fatalf("Fail to install chaos experiment, due to %v", err)
			}

			//Installing Chaos Engine for pod-cpu-hog
			By("[Install]: Installing chaos engine")
			//Providing wrong engine-state
			if err := pkg.InstallGoChaosEngine(&testsDetails, testsDetails.ChaosNamespace); err != nil {
				log.Fatalf("Fail to install chaos engine, due to %v", err)
			}

			//Checking runner pod creation
			By("[Status]: Runner pod running status check")
			if _, err := pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients); err != nil {
				log.Fatalf("Runner pod status check failed, due to %v", err)
			}

			//Waiting for Job Pod Creation
			klog.Info("Waiting for job pod creation ...")
			time.Sleep(15 * time.Second)

			//Abort the chaos experiment
			By("[Abort]: Abort the chaos by patching engine state")
			if err := pkg.ChaosAbort(&testsDetails); err != nil {
				log.Fatalf("[Abort]: Chaos abort failed, due to %v", err)
			}

			//Checking the Chaos Pod Status
			By("[Status]: Wait for job completion and then print logs")
			if _, err := pkg.JobLogs(&testsDetails, testsDetails.AppNS, clients); err == nil {
				log.Fatalf("[TEST FAILED]: Unable to remove job pod after abort")
			}

			//Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			if chaosResult, err := pkg.GetChaosResultVerdict(&testsDetails, clients); err != nil || chaosResult != "Stopped" {
				log.Fatalf("ChasoResult Verdict is not Stopped, %v", err)
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
			environment.GetENV(&testsDetails, "pod-cpu-hog", "engine-state")

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			if chaosEngineVerdict, err := pkg.GetChaosEngineVerdict(&testsDetails, clients); err != nil {
				log.Fatalf("Fail to get ChaosEngine Verdict due to, %v", err)
			} else if chaosEngineVerdict != "Stopped" {
				log.Fatalf("ChaosEngine Verdict is not Stopped")
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
