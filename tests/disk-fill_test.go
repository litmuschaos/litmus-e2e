package tests

import (
	"testing"

	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus-e2e/pkg"
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	"k8s.io/klog"
)

func TestGoDiskFill(t *testing.T) {

	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests for disk-fill experiment
var _ = Describe("BDD of disk-fill experiment", func() {

	// BDD TEST CASE 1
	Context("Check for disk fill chaos experiment", func() {

		It("Should check for creation of runner pod for disk fill", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			chaosExperiment := v1alpha1.ChaosExperiment{}
			chaosEngine := v1alpha1.ChaosEngine{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "disk-fill", "go-engine2")

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

			//Waiting for chaos pod to get completed
			//And Print the logs of the chaos pod
			By("[Status]: Wait for chaos pod completion and then print logs")
			err = pkg.ChaosPodLogs(&testsDetails, clients)
			Expect(err).To(BeNil(), "Failed to get the experiment chaos pod logs due to {%v}", err)

			//Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			err = pkg.ChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChasoResult Verdict check failed due to {%v}", err)

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			err = pkg.ChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed due to {%v}", err)

		})

		// BDD TEST CASE 3
		Context("Check disk fill experiment with annotation true", func() {

			It("Should check the disk fill experiment when app is annotated", func() {

				testsDetails := types.TestDetails{}
				clients := environment.ClientSets{}
				chaosExperiment := v1alpha1.ChaosExperiment{}
				chaosEngine := v1alpha1.ChaosEngine{}

				//Getting kubeConfig and Generate ClientSets
				By("[PreChaos]: Getting kubeconfig and generate clientset")
				err := clients.GenerateClientSetFromKubeConfig()
				Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

				//Fetching all the default ENV
				//Note: please don't provide custom experiment name here
				By("[PreChaos]: Fetching all default ENVs")
				klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
				environment.GetENV(&testsDetails, "disk-fill", "disk-fill-annotated")

				// Checking the chaos operator running status
				By("[Status]: Checking chaos operator status")
				err = pkg.OperatorStatusCheck(&testsDetails, clients)
				Expect(err).To(BeNil(), "Operator status check failed due to {%v}", err)

				//Installing RBAC for the experiment
				By("[Install]: Installing RBAC")
				err = pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace)
				Expect(err).To(BeNil(), "Failed to install rbac due to {%v}", err)

				//Installing Chaos Experiment for disk-fill
				By("[Install]: Installing chaos experiment")
				err = pkg.InstallGoChaosExperiment(&testsDetails, &chaosExperiment, testsDetails.ChaosNamespace, clients)
				Expect(err).To(BeNil(), "Failed to install chaos experiment due to {%v}", err)

				//Installing Chaos Engine for disk-fill
				By("[Install]: Installing chaos engine")
				testsDetails.AnnotationCheck = "true"
				err = pkg.InstallGoChaosEngine(&testsDetails, &chaosEngine, testsDetails.ChaosNamespace, clients)
				Expect(err).To(BeNil(), "Failed to install chaosengine due to {%v}", err)

				//Checking runner pod running state
				By("[Status]: Runner pod running status check")
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
				err = pkg.ChaosResultVerdict(&testsDetails, clients)
				Expect(err).To(BeNil(), "ChasoResult Verdict check failed due to {%v}", err)

				//Checking chaosengine verdict
				By("Checking the Verdict of Chaos Engine")
				err = pkg.ChaosEngineVerdict(&testsDetails, clients)
				Expect(err).To(BeNil(), "ChaosEngine Verdict check failed due to {%v}", err)

			})

		})
	})
})
