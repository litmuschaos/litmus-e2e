package tests

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

func TestGoMemoryHog(t *testing.T) {

	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests for pod-memory-hog experiment
var _ = Describe("BDD of pod-memory-hog experiment", func() {

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
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-memory-hog", "go-engine10")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			if err := pkg.OperatorStatusCheck(&testsDetails, clients); err != nil {
				log.Fatalf("Operator status check failed, due to %v", err)
			}

			//Installing RBAC for the experiment
			By("[Install]: Installing RBAC")
			if err := pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace); err != nil {
				log.Fatalf("Fail to install rbac, due to %v", err)
			}

			//Installing Chaos Experiment for pod-memory-hog
			By("[Install]: Installing chaos experiment")
			if err := pkg.InstallGoChaosExperiment(&testsDetails, testsDetails.ChaosNamespace); err != nil {
				log.Fatalf("Fail to install chaos experiment, due to %v", err)
			}

			//Installing Chaos Engine for pod-memory-hog
			By("[Install]: Installing chaos engine")
			if err := pkg.InstallGoChaosEngine(&testsDetails, testsDetails.ChaosNamespace); err != nil {
				log.Fatalf("Fail to install chaosengine, due to %v", err)
			}

			//Checking runner pod running state
			By("[Status]: Runner pod running status check")
			if _, err := pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients); err != nil {
				log.Fatalf("Runner pod status check failed, due to %v", err)
			}

			//Waiting for experiment job to get completed
			//And Print the logs of the job pod (chaos pod)
			By("[Status]: Wait for job completion and then print logs")
			if _, err := pkg.JobLogs(&testsDetails, testsDetails.AppNS, clients); err != nil {
				log.Fatalf("Fail to get the experiment job pod logs, due to %v", err)
			}

			//Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			if _, err := pkg.ChaosResultVerdict(&testsDetails, clients); err != nil {
				log.Fatalf("ChasoResult Verdict check failed, due to %v", err)
			}

		})
	})
	// BDD for checking chaosengine Verdict
	Context("Check for chaos engine verdict", func() {

		It("Should check for the verdict of experiment", func() {

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
			environment.GetENV(&testsDetails, "pod-memory-hog", "go-engine10")

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			if _, err := pkg.ChaosEngineVerdict(&testsDetails, clients); err != nil {
				log.Fatalf("ChaosEngine Verdict check failed, due to %v", err)
			}

		})
	})

	// BDD for pipeline result update
	Context("Check for the result update", func() {

		It("Should check for the result updation", func() {

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
			environment.GetENV(&testsDetails, "pod-memory-hog", "go-engine10")

			//Updating the pipeline result table
			By("Updating the pipeline result table")
			//Getting chaosengine verdict
			By("Getting Verdict of Chaos Engine")
			ChaosEngineVerdict, err := pkg.GetChaosEngineVerdict(&testsDetails, clients)
			if err != nil {
				log.Fatalf("Getting ChaosEngine Verdict failed, due to %v", err)
			}

			if err := pkg.UpdateResultTable("Consume memory resources on the application container", ChaosEngineVerdict, &testsDetails); err != nil {
				log.Fatalf("Job Result table updation failed, due to %v", err)
			}
		})
	})
})
