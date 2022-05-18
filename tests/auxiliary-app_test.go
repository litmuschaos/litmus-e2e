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

func TestAuxiliaryApp(t *testing.T) {

	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests to check application deployment
var _ = Describe("BDD of Auxilary app Deployment", func() {

	// BDD TEST CASE 1
	Context("Check for the application", func() {

		It("Should check for creation of application", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "deploy-aux-app", "")

			//Deploying testpod application
			By("Creating auxiliary application")
			command := []string{"run", "testpod", "--image=nginx", "-n", testsDetails.ChaosNamespace}
			err = pkg.Kubectl(command...)
			Expect(err).To(BeNil(), "Failed to deploy auxiliary app due to {%v}", err)

			//Get the status of testpod Application
			By("Running Deployment Status Check")
			err = pkg.DeploymentStatusCheck(&testsDetails, "testpod", "litmus", clients)
			Expect(err).To(BeNil(), "Application Status check faied due to {%v}", err)

			klog.Infof("Auxiliary Application installed successfully")

		})
	})

})
