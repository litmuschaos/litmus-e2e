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

func TestGoEC2Terminate(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD for testing experiment
var _ = Describe("BDD of ec2-terminate experiment", func() {

	// BDD TEST CASE 1
	Context("Check for ec2-terminate experiment", func() {

		It("Should check for the ec2 terminate experiment", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig, due to {%v}", err)

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "ec2-terminate", "go-engine-ec2")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed, due to {%v}", err)

			//Installing RBAC for the experiment
			By("[Install]: Installing RBAC")
			testsDetails.RbacPath = "https://hub.litmuschaos.io/api/chaos/master?file=charts/kube-aws/ec2-terminate/rbac.yaml"
			err = pkg.InstallGoRbac(&testsDetails, "")
			Expect(err).To(BeNil(), "Fail to install rbac, due to {%v}", err)

			//Installing Chaos Experiment
			By("[Install]: Installing chaos experiment")
			testsDetails.ExperimentPath = "https://hub.litmuschaos.io/api/chaos/master?file=charts/kube-aws/ec2-terminate/experiment.yaml"
			err = pkg.InstallGoChaosExperiment(&testsDetails, "default")
			Expect(err).To(BeNil(), "Fail to install chaos experiment, due to {%v}", err)

			//Installing Chaos Engine
			By("[Install]: Installing chaos engine")
			testsDetails.AppLabel = ""
			testsDetails.EnginePath = "https://hub.litmuschaos.io/api/chaos/master?file=charts/kube-aws/ec2-terminate/engine.yaml"
			err = pkg.InstallGoChaosEngine(&testsDetails, "default")
			Expect(err).To(BeNil(), "Fail to install chaosengine, due to {%v}", err)

			//Checking runner pod running state
			By("[Status]: Runner pod running status check")
			testsDetails.ChaosNamespace = "default"
			testsDetails.AppNS = "default"
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

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			testsDetails.ChaosNamespace = "default"
			err = pkg.ChaosEngineVerdict(&testsDetails, clients)
			Expect(err).To(BeNil(), "ChaosEngine Verdict check failed, due to {%v}", err)

		})
	})
})
