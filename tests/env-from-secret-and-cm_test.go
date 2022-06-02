package tests

import (
	"bytes"
	"fmt"
	"os/exec"
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

func TestGoEnvFromSecretAndConfigMap(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD for testing experiment
var _ = Describe("BDD of pod-delete experiment", func() {

	// BDD TEST CASE 1
	Context("Check for pod-delete experiment", func() {

		It("Should check for the pod delete experiment", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			var out, stderr bytes.Buffer
			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			// engineName form manifest/env_from_secret_configMap/pod-delete.yml
			environment.GetENV(&testsDetails, "pod-delete", "env-from-secret-and-cm-test")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed due to {%v}", err)

			//Installing RBAC for the experiment
			By("[Install]: Installing RBAC")
			err = pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Failed to install rbac due to {%v}", err)

			//Setup and run pod-delete chaosexperiment
			cmd := exec.Command("kubectl", "apply", "-f", "../manifest/env_from_secret_configMap/pod-delete.yml")
			cmd.Stdout = &out
			cmd.Stderr = &stderr
			err = cmd.Run()
			if err != nil {
				klog.Infof(fmt.Sprint(err) + ": " + stderr.String())
				Expect(err).To(BeNil(), "Failed to create the experiment file due to {%v}", err)
			}
			klog.Infof("[PodDeleteChaos]: " + out.String())

			// TODO: Wait dynamically for runner pod
			time.Sleep(3 * time.Second)
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

		})
		It("Should check for the verdict of pod-delete experiment", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-delete", "env-from-secret-and-cm-test")

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			err = pkg.ChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed due to {%v}", err)

		})
	})
})
