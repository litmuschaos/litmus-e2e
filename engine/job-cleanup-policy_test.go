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

func TestEngineName(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests for job-cleanup-policy in engine
//Testing with Job Cleanup policy 'retain'
var _ = Describe("BDD of job cleanup policy test", func() {

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
			environment.GetENV(&testsDetails, "container-kill", "job-cleanup-policy-engine")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			if err := pkg.OperatorStatusCheck(&testsDetails, clients); err != nil {
				log.Fatalf("Operator status check failed, due to %v", err)
			}

			//Installing RBAC for the job-cleanup-policy test
			By("[Install]: Installing RBAC")
			if err := pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace); err != nil {
				log.Fatalf("Fail to install rbac, due to %v", err)
			}

			//Installing Chaos Experiment for container-kill
			By("[Install]: Installing chaos experiment")
			if err := pkg.InstallGoChaosExperiment(&testsDetails, testsDetails.ChaosNamespace); err != nil {
				log.Fatalf("Fail to install chaos experiment, due to %v", err)
			}

			//Installing Chaos Engine for container-kill
			By("[Install]: Installing chaos engine")
			//Providing wrong job-cleanup-policy
			if err := pkg.InstallGoChaosEngine(&testsDetails, testsDetails.ChaosNamespace); err != nil {
				log.Fatalf("Fail to install chaos engine, due to %v", err)
			}

			//Checking runner pod creation
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

			//Wait for few seconds and check again the job status
			time.Sleep(5 * time.Second)

			//Again check the job status
			By("[Status]: Again checking the Job pod status for retain policy")
			if _, err := pkg.JobLogs(&testsDetails, testsDetails.AppNS, clients); err != nil {
				log.Fatalf("Fail to get the experiment job pod logs, due to %v", err)
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

	//Re-run the test with job cleanup policy 'delete'
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
			environment.GetENV(&testsDetails, "container-kill", "job-cleanup-policy-engine")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			if err := pkg.OperatorStatusCheck(&testsDetails, clients); err != nil {
				log.Fatalf("Operator status check failed, due to %v", err)
			}

			//Installing RBAC for the job-cleanup-policy test
			By("[Install]: Installing RBAC")
			if err := pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace); err != nil {
				log.Fatalf("Fail to install rbac, due to %v", err)
			}

			//Installing Chaos Experiment for container-kill
			By("[Install]: Installing chaos experiment")
			if err := pkg.InstallGoChaosExperiment(&testsDetails, testsDetails.ChaosNamespace); err != nil {
				log.Fatalf("Fail to install chaos experiment, due to %v", err)
			}

			//Installing Chaos Engine for container-kill
			By("[Install]: Installing chaos engine")
			//Providing wrong job-cleanup-policy
			testsDetails.JobCleanUpPolicy = "delete"
			if err := pkg.InstallGoChaosEngine(&testsDetails, testsDetails.ChaosNamespace); err != nil {
				log.Fatalf("Fail to install chaos engine, due to %v", err)
			}

			//Checking runner pod creation
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

			//Wait for few seconds and check again the job status
			time.Sleep(5 * time.Second)

			//Again check the job status
			By("[Status]: Again checking the Job pod status for retain policy")
			if _, err := pkg.JobLogs(&testsDetails, testsDetails.AppNS, clients); err == nil {
				log.Fatalf("[TEST FAILED]: Job pod found after chaos with cleaup policy delete, due to %v", err)
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
