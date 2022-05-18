package tests

import (
	"fmt"
	"os"
	"testing"

	"github.com/litmuschaos/litmus-e2e/pkg"
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	"k8s.io/klog"
)

func TestLitmusCleanup(t *testing.T) {

	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests to delete litmus
var _ = Describe("BDD of litmus cleanup", func() {

	// BDD TEST CASE 1
	Context("Check for the litmus components", func() {

		It("Should check for deletion of Litmus", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			var err error
			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err = clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "litmus-cleanup", "")

			//Deleting all chaosengines
			By("Deleting all chaosengine")
			command := []string{"delete", "chaosengine,chaosexperiment,chaosresult", "--all", "--all-namespaces"}
			err = pkg.Kubectl(command...)
			Expect(err).To(BeNil(), "failed to delete CRs")
			klog.Info("All CRs deleted successfully")

			//Deleting crds
			By("Delete chaosengine crd")
			command = []string{"delete", "-f", "https://raw.githubusercontent.com/litmuschaos/chaos-operator/master/deploy/chaos_crds.yaml"}
			err = pkg.Kubectl(command...)
			Expect(err).To(BeNil(), "failed to delete crds")
			klog.Info("crds deleted successfully")

			//Deleting rbac
			By("Delete chaosengine rbac")
			command = []string{"delete", "-f", "https://raw.githubusercontent.com/litmuschaos/chaos-operator/master/deploy/rbac.yaml"}
			err = pkg.Kubectl(command...)
			Expect(err).To(BeNil(), "failed to create rbac")
			klog.Info("rbac deleted sucessfully")

			if os.Getenv("COMPONENT_TEST") == "true" {
				//Delete test deployments from default namespace
				By("Delete test deployments")
				command = []string{"delete", "deploy", "testapp1", "adminapp", "testapp2"}
				err = pkg.Kubectl(command...)
				if err != nil {
					fmt.Println("Failed to delete the deployments from default namespace due to ", err)
				}

				//Delete test namespace
				By("Delete test namespace")
				command = []string{"delete", "ns", "test"}
				err = pkg.Kubectl(command...)
				Expect(err).To(BeNil(), "Failed to delete test namespace")
			}
		})
	})
})
