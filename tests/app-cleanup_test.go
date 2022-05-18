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

func TestAppCleanUpComponentLevel(t *testing.T) {

	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests to check application cleanup
var _ = Describe("BDD of Application Cleanup", func() {

	// BDD TEST CASE 1
	Context("Checking for the application", func() {

		It("Should check for deletion of application", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "app-cleanup", "")

			//Removing Application
			By("Deleting Application")
			command := []string{"delete", "-f", "../apps/nginx/nginx.yml"}
			err = pkg.Kubectl(command...)
			Expect(err).To(BeNil(), "Failed to delete application and its components due to {%v}", err)

			//Get the status of sample Application
			err = pkg.DeploymentCleanupCheck(&testsDetails, "nginx", clients)
			Expect(err).To(BeNil(), "Application Status check faied due to {%v}", err)

		})
	})
})
