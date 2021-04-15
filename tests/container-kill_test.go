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
	Context("Check for container-kill experiment", func() {

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

			// Prepare Chaos Execution
			By("[Prepare]: Prepare Chaos Execution")
			testsDetails.LibImageCI = testsDetails.LibImageNew
			err = pkg.PrepareChaos(&testsDetails, false)
			Expect(err).To(BeNil(), "fail to prepare chaos, due to {%v}", err)

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
			err = pkg.ChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChasoResult Verdict check failed, due to {%v}", err)

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			err = pkg.ChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)

		})

		// BDD TEST CASE 2
		//Add abort-chaos for the chaos experiment
		Context("Abort-Chaos check for container kill chaos", func() {

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

				// Prepare Chaos Execution
				By("[Prepare]: Prepare Chaos Execution")
				testsDetails.LibImageCI = testsDetails.LibImageNew
				err = pkg.PrepareChaos(&testsDetails, false)
				Expect(err).To(BeNil(), "fail to prepare chaos, due to {%v}", err)

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

		// BDD TEST CASE 3
		Context("Check with annotation true for container kill experiment", func() {

			It("Should check the container kill experiment when app is annotated", func() {

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
				environment.GetENV(&testsDetails, "container-kill", "container-kill-annotated")

				// Checking the chaos operator running status
				By("[Status]: Checking chaos operator status")
				err = pkg.OperatorStatusCheck(&testsDetails, clients)
				Expect(err).To(BeNil(), "Operator status check failed, due to {%v}", err)

				// Prepare Chaos Execution
				By("[Prepare]: Prepare Chaos Execution")
				testsDetails.LibImageCI = testsDetails.LibImageNew
				err = pkg.PrepareChaos(&testsDetails, true)
				Expect(err).To(BeNil(), "fail to prepare chaos, due to {%v}", err)

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
				err = pkg.ChaosResultVerdict(&testsDetails, clients)
				Expect(err).To(BeNil(), "ChasoResult Verdict check failed, due to {%v}", err)

				//Checking chaosengine verdict
				By("Checking the Verdict of Chaos Engine")
				err = pkg.ChaosEngineVerdict(&testsDetails, clients)
				Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)
			})
		})

		// BDD TEST CASE 4
		Context("Check for pumba lib of container kill experiment", func() {

			It("Should check the container-kill experiment when lib is set to pumba", func() {

				testsDetails := types.TestDetails{}
				clients := environment.ClientSets{}

				klog.Info("RUNNING CONTAINER KILL PUMBA LIB TEST!!!")
				//Getting kubeConfig and Generate ClientSets
				By("[PreChaos]: Getting kubeconfig and generate clientset")
				err := clients.GenerateClientSetFromKubeConfig()
				Expect(err).To(BeNil(), "Unable to Get the kubeconfig, due to {%v}", err)

				//Fetching all the default ENV
				//Note: please don't provide custom experiment name here
				By("[PreChaos]: Fetching all default ENVs")
				klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
				environment.GetENV(&testsDetails, "container-kill", "container-kill-pumba")

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
				testsDetails.LibImageCI = testsDetails.LibImageNew
				testsDetails.Lib = "pumba"
				err = pkg.InstallGoChaosExperiment(&testsDetails, testsDetails.ChaosNamespace)
				Expect(err).To(BeNil(), "Fail to install chaos experiment, due to {%v}", err)

				//Installing Chaos Engine for container-kill
				By("[Install]: Installing chaos engine")
				testsDetails.AnnotationCheck = "true"
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
				err = pkg.ChaosResultVerdict(&testsDetails, clients)
				Expect(err).To(BeNil(), "ChasoResult Verdict check failed, due to {%v}", err)

				//Checking chaosengine verdict
				By("Checking the Verdict of Chaos Engine")
				err = pkg.ChaosEngineVerdict(&testsDetails, clients)
				Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)

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

				if testsDetails.UpdateWebsite == "true" {
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

					//Getting chaosengine verdict for annotation test
					By("Getting Verdict of Chaos Engine for abort test")
					testsDetails.EngineName = "container-kill-annotated"
					ChaosEngineVerdictForAnnotation, err := pkg.GetChaosEngineVerdict(&testsDetails, clients)
					Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)
					if ChaosEngineVerdictForAnnotation != "Pass" {
						ChaosEngineVerdict = "Fail"
						klog.Error("Annotation test verdict is not Pass")
					}

					By("Getting Verdict of Chaos Engine for pumba lib test")
					testsDetails.EngineName = "container-kill-pumba"
					ChaosEngineVerdictForPumba, err := pkg.GetChaosEngineVerdict(&testsDetails, clients)
					Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)
					if ChaosEngineVerdictForPumba != "Pass" {
						ChaosEngineVerdict = "Fail"
						klog.Error("Pumba test verdict is not Pass")
					}

					//Updating the pipeline result table
					By("Updating the pipeline result table")
					err = pkg.UpdateResultTable("Kill one container in the application pod", ChaosEngineVerdict, &testsDetails)
					Expect(err).To(BeNil(), "Job Result Updation failed, due to {%v}", err)
				} else {
					klog.Info("[SKIP]: Skip updating the result on website")
				}

			})
		})
	})
})
