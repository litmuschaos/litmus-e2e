package operator

import (
	"fmt"
	"os/exec"
	"testing"

	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus-e2e/pkg"
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/log"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
)

func TestReconcileResiliency(t *testing.T) {

	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests for operator reconcile resiliency
//Checking for the creation of runner pod for application in same namespace
var _ = Describe("BDD of operator reconcile resiliency check", func() {

	// BDD TEST CASE 1
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

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
			log.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-delete", "reconsile-engine1")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed due to {%v}", err)

			//Creating first application for pod-delete in default namespace
			By("Creating first deployment for pod-delete chaos")
			err = pkg.CreateDeployment(clients, "testapp1", "nginx:1.12", "default")
			Expect(err).To(BeNil(), "create testapp1 deployment due to {%v}", err)

			//Waiting for deployment to get ready
			err = pkg.DeploymentStatusCheck(&testsDetails, "testapp1", "default", clients)
			Expect(err).To(BeNil(), "Error Timeout due to {%v}", err)

			//Creating second application for container-kill in default namespace
			By("Creating second deployment for container-kill chaos")
			err = pkg.CreateDeployment(clients, "testapp2", "nginx:1.12", "litmus")
			Expect(err).To(BeNil(), "create testapp2 deployment due to {%v}", err)

			//Waiting for deployment to get ready
			err = pkg.DeploymentStatusCheck(&testsDetails, "testapp2", "default", clients)
			Expect(err).To(BeNil(), "Error Timeout due to {%v}", err)

			////////////////////////////////////////////////////////
			//   Prepare Two Chaos Experiments at the same time  //
			//////////////////////////////////////////////////////

			//Installing RBAC for first chaos experiment that is pod-delete
			By("[Install]: Install rbac for pod-delete chaos")
			testsDetails.ChaosNamespace = "default"
			//Fetching all the default ENV
			err = pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Failed to install rbac due to {%v}", err)

			//Installing Chaos Experiment for pod-delete
			By("[Install]: Installing chaos experiment")
			err = pkg.InstallGoChaosExperiment(&testsDetails, &chaosExperiment, testsDetails.ChaosNamespace, clients)
			Expect(err).To(BeNil(), "Failed to install chaos experiment due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			log.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "container-kill", "reconsile-engine2")
			testsDetails.ChaosNamespace = "litmus"

			//Installing RBAC for first chaos experiment that is container-kill
			By("[Install]: Install rbac for pod-delete chaos")
			err = pkg.InstallGoRbac(&testsDetails, testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Failed to install rbac due to {%v}", err)

			//Installing Chaos Experiment for container-kill
			By("[Install]: Installing chaos experiment")
			err = pkg.InstallGoChaosExperiment(&testsDetails, &chaosExperiment, testsDetails.ChaosNamespace, clients)
			Expect(err).To(BeNil(), "Failed to install chaos experiment due to {%v}", err)

			/////////////////////////////////////////////////////
			//   Check the runner pod status for both chaos   ///
			/////////////////////////////////////////////////////

			//Creating Chaos-Engine for container-kill
			By("[Install]: Install Chaos Engine for container-kill")
			testsDetails.AppLabel = "run=testapp2"
			err = pkg.InstallGoChaosEngine(&testsDetails, &chaosEngine, testsDetails.ChaosNamespace, clients)
			Expect(err).To(BeNil(), "Failed to install chaosengine due to {%v}", err)

			//Checking the runner pod status
			By("[Status]: Runner pod running status check")
			err = pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients)
			Expect(err).To(BeNil(), "Runner pod status check failed due to {%v}", err)

			//Fetching all the default ENV
			//Note: please don't provide custom experiment name here
			By("[PreChaos]: Fetching all default ENVs")
			log.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-delete", "reconsile-engine1")
			testsDetails.ChaosNamespace = "default"

			//Creating Chaos-Engine for pod-delete
			By("[Install]: Install Chaos Engine for pod-delete")
			testsDetails.AppLabel = "run=testapp1"
			testsDetails.AppNS = "default"
			err = pkg.InstallGoChaosEngine(&testsDetails, &chaosEngine, testsDetails.ChaosNamespace, clients)
			Expect(err).To(BeNil(), "Failed to install chaosengine due to {%v}", err)

			// Checking the runner pod status
			By("[Status]: Runner pod running status check")
			testsDetails.AppNS = "default"
			err = pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients)
			Expect(err).To(BeNil(), "Runner pod status check failed due to {%v}", err)

			//Visualising the components at default namespace
			By("Getting the components in default namespace")
			out1, err1 := exec.Command("kubectl", "get", "pods").Output()
			if err1 != nil {
				log.Fatalf("error:", err1)
			}
			fmt.Printf("The output is: %s\n", out1)

			//Visualising the components at chaosNamespace namespace
			By("Getting the components in chaosNamespace namespace")
			out2, err2 := exec.Command("kubectl", "get", "pods", "-n", testsDetails.ChaosNamespace).Output()
			if err2 != nil {
				log.Fatalf("error:", err2)
			}
			fmt.Printf("The output is: %s\n", out2)
		})
	})
})
