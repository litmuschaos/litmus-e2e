package tests

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

func TestGoContainerKill(t *testing.T) {

	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests for container-kill experiment
var _ = Describe("BDD of container-kill experiment", func() {

	// BDD TEST CASE 1
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig, due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "container-kill", "go-engine1")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed, due to {%v}", err)

			//Installing RBAC for the experiment
			By("[Install]: Installing RBAC")
			err = pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install rbac, due to {%v}", err)

			//Installing Chaos Experiment for container-kill
			By("[Install]: Installing chaos experiment")
			testsDetails.LibImageCI = "litmuschaos/go-runner:ci"
			err = pkg.InstallGoChaosExperiment(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install chaos experiment, due to {%v}", err)

			//Installing Chaos Engine for container-kill
			By("[Install]: Installing chaos engine")
			err = pkg.InstallGoChaosEngine(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install chaosengine, due to {%v}", err)

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
			_, err = pkg.ChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChasoResult Verdict check failed, due to {%v}", err)

		})
	})
	// BDD for checking chaosengine Verdict
	Context("Check for chaos engine verdict", func() {

		It("Should check for the verdict of experiment", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig, due to {%v}", err)

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "container-kill", "go-engine1")

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			err = pkg.ChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)
		})
	})

	// BDD TEST CASE 2
	//Add abort-chaos for the chaos experiment
	Context("Abort-Chaos check of litmus component", func() {

		It("Should check the abort of container-kill experiment", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			klog.Info("RUNNING CONTAINER-KILL ABORT CHAOS TEST!!!")
			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig, due to {%v}", err)

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "container-kill", "container-kill-abort")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed, due to {%v}", err)

			//Installing RBAC for the experiment
			By("[Install]: Installing RBAC")
			err = pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install rbac, due to {%v}", err)

			//Installing Chaos Experiment
			By("[Install]: Installing chaos experiment")
			err = pkg.InstallGoChaosExperiment(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install chaos experiment, due to {%v}", err)

			//Installing Chaos Engine
			By("[Install]: Installing chaos engine")
			err = pkg.InstallGoChaosEngine(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Fail to install chaosengine, due to {%v}", err)

			//Checking runner pod running state
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
			//But the chaos should be aborted before hand
			By("[Status]: Wait for chaos pod completion and then print logs")
			err = pkg.ChaosPodLogs(&testsDetails, clients)
			Expect(err).NotTo(BeNil(), "[TEST FAILED]: Unable to remove chaos pod after abort")

			//Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			chaosResult, err := pkg.GetChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "Fail to get the chaosresult Verdict, due to {%v}", err)
			Expect(chaosResult).To(Equal("Stopped"), "ChasoResult Verdict is not Stopped, due to {%v}", err)

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			chaosEngineVerdict, err := pkg.GetChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "Fail to get the chaosengine Verdict, due to {%v}", err)
			Expect(chaosEngineVerdict).To(Equal("Stopped"), "ChaosEngine Verdict is not Stopped, due to {%v}", err)

		})
	})

	// BDD for pipeline result update
	Context("Check for the result update", func() {

		It("Should check for the result updation", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig, due to {%v}", err)

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "container-kill", "go-engine1")

			//Getting chaosengine verdict
			By("Getting Verdict of Chaos Engine")
			ChaosEngineVerdict, err := pkg.GetChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)
			Expect(ChaosEngineVerdict).NotTo(BeEmpty(), "Fail to get chaos engine verdict, due to {%v}", err)

			//Getting chaosengine verdict for abort test
			By("Getting Verdict of Chaos Engine for abort test")
			testsDetails.EngineName = "container-kill-abort"
			ChaosEngineVerdictForAbort, err := pkg.GetChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)
			if ChaosEngineVerdictForAbort != "Stopped" {
				ChaosEngineVerdict = "Fail"
				klog.Error("Abort chaos test verdict is not Pass")
			}

			//Updating the pipeline result table
			By("Updating the pipeline result table")
			err = pkg.UpdateResultTable("Kill one container in the application pod", ChaosEngineVerdict, &testsDetails)
			Expect(err).To(BeNil(), "Job Result Updation failed, due to {%v}", err)

		})
	})
})
