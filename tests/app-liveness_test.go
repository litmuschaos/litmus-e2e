package tests

import (
	"log"
	"os/exec"
	"testing"

	"github.com/litmuschaos/litmus-e2e/pkg"
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/types"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	"k8s.io/klog"
)

func TestLiveness(t *testing.T) {

	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests to check application deployment
var _ = Describe("BDD of Application Deployment", func() {

	// BDD TEST CASE 1
	Context("Check for the application", func() {

		It("Should check for creation of liveness pod", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			if err := clients.GenerateClientSetFromKubeConfig(); err != nil {
				klog.Infof("Unable to Get the kubeconfig due to %v", err)
			}

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "app-deploy", "")

			//Deploying liveness for application
			By("Deploying liveness pod for the applicaiton")
			if err := exec.Command("kubectl", "apply", "-f", "../nginx/liveness.yml").Run(); err != nil {
				log.Fatalf("Failed to install liveness probe,due to %v", err)
			}

			//Get the status of liveness pod
			By("liveness pod status check")
			if err := pkg.PodStatusCheck(&testsDetails, clients); err != nil {
				log.Fatalf("liveness pod status check faied,due to %v", err)
			}
			klog.Info("Liveness pod established successfully !!!")

		})
	})

})
