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

func TestGoPodAffectedPercentageParallel(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD for testing experiment
var _ = Describe("BDDs to check pod level experiment with affected percentage 100 and sequence in parallel", func() {

	// BDD for cleaning all components before running the test
	Context("cleanup for litmus components", func() {

		It("Should delete all the litmus CRs", func() {

			By("[Cleanup]: Removing Litmus Components")
			err := pkg.Cleanup()
			if err != nil {
				klog.Info("Nothing to cleanup...")
			}
		})
	})

	// BDD TEST CASE 1
	Context("Check for pod-delete experiment with 100% affected and sequence parallel", func() {

		It("Should check for the pod delete experiment", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			chaosExperiment := v1alpha1.ChaosExperiment{}
			chaosEngine := v1alpha1.ChaosEngine{}

			klog.Info("POD DELETE EXPERIMENT WITH PODS_AFFECTED_PERC=100 AND SEQUENCE=PARALLEL")
			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-delete", "pod-del-pap-100-par")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed due to {%v}", err)

			// Prepare Chaos Execution
			By("[Prepare]: Prepare Chaos Execution")
			testsDetails.PodsAffectedPercentage = "100"
			err = pkg.PrepareChaos(&testsDetails, &chaosExperiment, &chaosEngine, clients, true)
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
	})

	// BDD TEST CASE 2
	Context("Check for container kill experiment with 100% affected and sequence parallel", func() {

		It("Should check the container kill with pod affected percentage 100 and mode is parallel", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			chaosExperiment := v1alpha1.ChaosExperiment{}
			chaosEngine := v1alpha1.ChaosEngine{}

			klog.Info("CONTAINER KILL EXPERIMENT WITH PODS_AFFECTED_PERC=100 AND SEQUENCE=PARALLEL")
			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "container-kill", "con-kill-pap-ton-par")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed due to {%v}", err)

			// Prepare Chaos Execution
			By("[Prepare]: Prepare Chaos Execution")
			testsDetails.PodsAffectedPercentage = "100"
			err = pkg.PrepareChaos(&testsDetails, &chaosExperiment, &chaosEngine, clients, true)
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
	})

	// BDD TEST CASE 3
	Context("Check for disk fill experiment with 100% affected and sequence parallel", func() {

		It("Should check the disk fill experiment when pod affected percentage is 100 and mode is parallel", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			chaosExperiment := v1alpha1.ChaosExperiment{}
			chaosEngine := v1alpha1.ChaosEngine{}

			klog.Info("DISK FILL EXPERIMENT WITH PODS_AFFECTED_PERC=100 AND SEQUENCE=PARALLEL")
			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "disk-fill", "disk-fill-pap-ton-par")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed due to {%v}", err)

			// Prepare Chaos Execution
			By("[Prepare]: Prepare Chaos Execution")
			testsDetails.PodsAffectedPercentage = "100"
			err = pkg.PrepareChaos(&testsDetails, &chaosExperiment, &chaosEngine, clients, true)
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
	})

	// BDD TEST CASE 4
	Context("Check pod cpu hog experiment with 100% affected and sequence parallel", func() {

		It("Should check the experiment when pod affected percentage is 100 and mode is parallel", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			chaosExperiment := v1alpha1.ChaosExperiment{}
			chaosEngine := v1alpha1.ChaosEngine{}

			klog.Info("POD CPU HOG EXPERIMENT WITH PODS_AFFECTED_PERC=100 AND SEQUENCE=PARALLEL")
			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-cpu-hog", "pod-cpu-hog-pap-100-par")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed due to {%v}", err)

			// Prepare Chaos Execution
			By("[Prepare]: Prepare Chaos Execution")
			testsDetails.PodsAffectedPercentage = "100"
			err = pkg.PrepareChaos(&testsDetails, &chaosExperiment, &chaosEngine, clients, true)
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
	})

	// BDD TEST CASE 5
	Context("Check pod memory hog experiment with 100% affected and sequence parallel", func() {

		It("Should check the experiment when pod affected percentage is 100 and mode is parallel", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			chaosExperiment := v1alpha1.ChaosExperiment{}
			chaosEngine := v1alpha1.ChaosEngine{}

			klog.Info("POD MEMORY HOG EXPERIMENT WITH PODS_AFFECTED_PERC=100 AND SEQUENCE=PARALLEL")
			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-memory-hog", "pod-mem-hog-pap-100-par")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed due to {%v}", err)

			// Prepare Chaos Execution
			By("[Prepare]: Prepare Chaos Execution")
			testsDetails.PodsAffectedPercentage = "100"
			err = pkg.PrepareChaos(&testsDetails, &chaosExperiment, &chaosEngine, clients, true)
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
	})

	// BDD TEST CASE 6
	Context("Check pod network corruption experiment with 100% affected and sequence parallel", func() {

		It("Should check the experiment when pod affected percentage is 100 and mode is parallel", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			chaosExperiment := v1alpha1.ChaosExperiment{}
			chaosEngine := v1alpha1.ChaosEngine{}

			klog.Info("POD NETWORK CORRUPTION EXPERIMENT WITH PODS_AFFECTED_PERC=100 AND SEQUENCE=PARALLEL")
			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-network-corruption", "pod-net-cor-pap-100-par")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed due to {%v}", err)

			// Prepare Chaos Execution
			By("[Prepare]: Prepare Chaos Execution")
			testsDetails.PodsAffectedPercentage = "100"
			err = pkg.PrepareChaos(&testsDetails, &chaosExperiment, &chaosEngine, clients, true)
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
	})
})
