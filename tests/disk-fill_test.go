package tests

import (
	"testing"

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

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig, due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "disk-fill", "go-engine2")

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

		// BDD TEST CASE 3
		Context("Check disk fill experiment with annotation true", func() {

			It("Should check the disk fill experiment when app is annotated", func() {

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
				environment.GetENV(&testsDetails, "disk-fill", "disk-fill-annotated")

				// Checking the chaos operator running status
				By("[Status]: Checking chaos operator status")
				err = pkg.OperatorStatusCheck(&testsDetails, clients)
				Expect(err).To(BeNil(), "Operator status check failed, due to {%v}", err)

				//Installing RBAC for the experiment
				By("[Install]: Installing RBAC")
				err = pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace)
				Expect(err).To(BeNil(), "Fail to install rbac, due to {%v}", err)

				//Installing Chaos Experiment for disk-fill
				By("[Install]: Installing chaos experiment")
				testsDetails.LibImageCI = testsDetails.LibImageNew
				err = pkg.InstallGoChaosExperiment(&testsDetails, testsDetails.ChaosNamespace)
				Expect(err).To(BeNil(), "Fail to install chaos experiment, due to {%v}", err)

				//Installing Chaos Engine for disk-fill
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
				environment.GetENV(&testsDetails, "disk-fill", "go-engine2")

				if testsDetails.UpdateWebsite == "true" {
					//Getting chaosengine verdict
					By("Getting Verdict of Chaos Engine")
					//Getting chaosengine verdict
					ChaosEngineVerdict, err := pkg.GetChaosEngineVerdict(&testsDetails, clients)
					Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)
					Expect(ChaosEngineVerdict).NotTo(BeEmpty(), "Fail to get chaos engine verdict, due to {%v}", err)

					//Getting chaosengine verdict for annotation test
					By("Getting Verdict of Chaos Engine for abort test")
					testsDetails.EngineName = "disk-fill-annotated"
					ChaosEngineVerdictForAnnotation, err := pkg.GetChaosEngineVerdict(&testsDetails, clients)
					Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)
					if ChaosEngineVerdictForAnnotation != "Pass" {
						ChaosEngineVerdict = "Fail"
						klog.Error("Annotation test verdict is not Pass")
					}

					//Updating the pipeline result table
					By("Updating the pipeline result table")
					err = pkg.UpdateResultTable("Disk Fill Fills up Ephemeral Storage of a Pod", ChaosEngineVerdict, &testsDetails)
					Expect(err).To(BeNil(), "Job Result Updation failed, due to {%v}", err)
				} else {
					klog.Info("[SKIP]: Skip updating the result on website")
				}

			})
		})
	})
})
