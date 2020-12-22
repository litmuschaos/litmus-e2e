package tests

import (
	"fmt"
	"os"
	"os/exec"
	"testing"

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
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig, due to {%v}", err)

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "litmus-cleanup", "")

			//Deleting all chaosengines
			By("Deleting all chaosengine")
			err = exec.Command("kubectl", "delete", "chaosengine,chaosexperiment,chaosresult", "--all", "--all-namespaces").Run()
			Expect(err).To(BeNil(), "failed to delete CRs")
			if err != nil {
				fmt.Println(err)
			}

			klog.Info("All CRs deleted successfully")

			//Deleting crds
			By("Delete chaosengine crd")
			err = exec.Command("kubectl", "delete", "-f", "https://raw.githubusercontent.com/litmuschaos/chaos-operator/master/deploy/chaos_crds.yaml").Run()
			Expect(err).To(BeNil(), "failed to delete crds")
			if err != nil {
				fmt.Println(err)
			}

			klog.Info("crds deleted successfully")

			//Deleting rbacs
			By("Delete chaosengine rbac")
			err = exec.Command("kubectl", "delete", "-f", "https://raw.githubusercontent.com/litmuschaos/chaos-operator/master/deploy/rbac.yaml").Run()
			Expect(err).To(BeNil(), "failed to create rbac")
			if err != nil {
				fmt.Println(err)
			}
			klog.Info("rbac deleted sucessfully")

			if os.Getenv("COMPONENT_LEVEL") == "true" {
				//Delete test deployments from default namespace
				By("Delete test deployments")
				err = exec.Command("kubectl", "delete", "deploy", "testapp1", "adminapp", "testapp2").Run()
				if err != nil {
					fmt.Println("fail to delete the deployments from default namespace, due to ", err)
				}

				//Delete test namespace
				By("Delete test namespace")
				err = exec.Command("kubectl", "delete", "ns", "test").Run()
				Expect(err).To(BeNil(), "Fail to delete test namespace")
				if err != nil {
					fmt.Println(err)
				}
			}
		})

	})
})
