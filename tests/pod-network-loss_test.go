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

func TestGoPodNetwokLoss(t *testing.T) {

	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests for pod-network-loss experiment
var _ = Describe("BDD of pod-network-loss experiment", func() {

	// BDD TEST CASE 1
	Context("Check for pod network loss", func() {

		It("Should check for creation of runner pod", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			var TargetPodIP string
			var HelperPod string
			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig, due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-network-loss", "go-engine14")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed, due to {%v}", err)

			//Get Target pod name and IP
			testsDetails.TargetPod, TargetPodIP, HelperPod, err = pkg.GetAppNameAndIP(testsDetails.AppLabel, testsDetails.AppNS, clients)
			Expect(err).To(BeNil(), "Fail to get the target pod details, due to {%v}", err)

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

			//Validate network chaos
			err = pkg.ValidateNetworkChaos(&testsDetails, TargetPodIP, HelperPod, clients)
			Expect(err).To(BeNil(), "Network chaos validation falied, due to {%v}", err)

			//Waiting for chaos pod to get completed
			//And Print the logs of the chaos pod
			By("[Status]: Wait for chaos pod completion and then print logs")
			err = pkg.ChaosPodLogs(&testsDetails, clients)
			Expect(err).To(BeNil(), "Fail to get the experiment chaos pod logs, due to {%v}", err)

			//Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			err = pkg.ChaosResultVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChasoResult Verdict check failed, due to {%v}", err)

		})

		// BDD for checking chaosengine Verdict
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
			environment.GetENV(&testsDetails, "pod-network-loss", "go-engine14")

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			err = pkg.ChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)

		})
	})

	// BDD TEST CASE 2
	//Add abort-chaos for pod-network-loss experiment
	Context("Abort-Chaos check for pod network loss experiment", func() {

		It("Should check the abort of pod-network-loss experiment", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			klog.Info("RUNNING POD-NETWORK-LOSS ABORT CHAOS TEST!!!")
			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig, due to {%v}", err)

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-network-loss", "pod-net-loss-abort")

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
	Context("Check for pod network loss experiment with annotation true", func() {

		It("Should check the experiment when app is annotated", func() {

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
			environment.GetENV(&testsDetails, "pod-network-loss", "pnloss-annotated")

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

		})

		// BDD for checking chaosengine Verdict when the annotation check is set to true
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
			environment.GetENV(&testsDetails, "pod-network-loss", "pnloss-annotated")

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			err = pkg.ChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)
		})
	})

	// BDD TEST CASE 4
	Context("Check for pumba lib of pod network loss experiment", func() {

		It("Should check the pod-network-loss experiment when lib is set to pumba", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			var TargetPodIP string
			var HelperPod string

			klog.Info("RUNNING POD-NETWORK-LOSS PUMBA LIB TEST!!!")
			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig, due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-network-loss", "pod-network-loss-pumba")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed, due to {%v}", err)

			// Prepare Chaos Execution
			By("[Prepare]: Prepare Chaos Execution")
			testsDetails.Lib = "pumba"
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

			//Validate network chaos
			err = pkg.ValidateNetworkChaos(&testsDetails, TargetPodIP, HelperPod, clients)
			Expect(err).To(BeNil(), "Network chaos validation falied, due to {%v}", err)

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
			environment.GetENV(&testsDetails, "pod-network-loss", "go-engine14")

			if testsDetails.UpdateWebsite == "true" {
				//Updating the pipeline result table
				By("Updating the pipeline result table")
				//Getting chaosengine verdict for experiment test
				By("Getting Verdict of Chaos Engine for experiment test")
				ChaosEngineVerdict, err := pkg.GetChaosEngineVerdict(&testsDetails, clients)
				Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)
				Expect(ChaosEngineVerdict).NotTo(BeEmpty(), "Fail to get chaos engine verdict, due to {%v}", err)

				//Getting chaosengine verdict for abort test
				By("Getting Verdict of Chaos Engine for abort test")
				testsDetails.EngineName = "pod-net-loss-abort"
				ChaosEngineVerdictForAbort, err := pkg.GetChaosEngineVerdict(&testsDetails, clients)
				Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)
				if ChaosEngineVerdictForAbort != "Stopped" {
					ChaosEngineVerdict = "Fail"
					klog.Error("Abort chaos test verdict is not Pass")
				}

				//Getting chaosengine verdict for annotation test
				By("Getting Verdict of Chaos Engine for annotation test")
				testsDetails.EngineName = "pnloss-annotated"
				ChaosEngineVerdictForAnnotate, err := pkg.GetChaosEngineVerdict(&testsDetails, clients)
				Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)
				if ChaosEngineVerdictForAnnotate != "Pass" {
					ChaosEngineVerdict = "Fail"
					klog.Error("Annotation test verdict is not Pass")
				}

				By("Getting Verdict of Chaos Engine for pumba lib test")
				testsDetails.EngineName = "pod-network-loss-pumba"
				ChaosEngineVerdictForPumba, err := pkg.GetChaosEngineVerdict(&testsDetails, clients)
				Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)
				if ChaosEngineVerdictForPumba != "Pass" {
					ChaosEngineVerdict = "Fail"
					klog.Error("Pumba test verdict is not Pass")
				}

				err = pkg.UpdateResultTable("Inject Packet Loss Into Application Pod", ChaosEngineVerdict, &testsDetails)
				Expect(err).To(BeNil(), "Job Result Updation failed, due to {%v}", err)
			} else {
				klog.Info("[SKIP]: Skip updating the result on website")
			}
		})
	})
})
