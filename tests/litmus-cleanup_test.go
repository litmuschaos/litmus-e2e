package tests

import (
	"fmt"
	"os"
	"os/exec"
	"testing"

	chaosTypes "github.com/litmuschaos/litmus-e2e/types"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"k8s.io/client-go/kubernetes"
	scheme "k8s.io/client-go/kubernetes/scheme"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	"k8s.io/client-go/tools/clientcmd"

	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	chaosClient "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	restclient "k8s.io/client-go/rest"
)

var (
	kubeconfig string
	config     *restclient.Config
	client     *kubernetes.Clientset
	clientSet  *chaosClient.LitmuschaosV1alpha1Client
	err        error
)

func TestChaos(t *testing.T) {

	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

var _ = BeforeSuite(func() {

	var err error
	kubeconfig = os.Getenv("HOME") + "/.kube/config"
	config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)

	if err != nil {
		Expect(err).To(BeNil(), "failed to get config")
	}

	client, err = kubernetes.NewForConfig(config)

	if err != nil {
		Expect(err).To(BeNil(), "failed to get client")
	}

	clientSet, err = chaosClient.NewForConfig(config)

	if err != nil {
		Expect(err).To(BeNil(), "failed to get clientSet")
	}

	err = v1alpha1.AddToScheme(scheme.Scheme)
	if err != nil {
		fmt.Println(err)
	}

})

//BDD Tests to delete litmus
var _ = Describe("BDD of litmus cleanup", func() {

	// BDD TEST CASE 1
	Context("Check for the litmus components", func() {

		It("Should check for deletion of Litmus", func() {

			//Deleting all chaosengines
			By("Deleting all chaosengine")
			err = exec.Command("kubectl", "delete", "chaosengine", "-n", chaosTypes.ChaosNamespace, "--all").Run()
			Expect(err).To(BeNil(), "failed to delete chaosengine")
			if err != nil {
				fmt.Println(err)
			}

			fmt.Println("All chaosengine deleted successfully")

			//Deleting all chaosexperiment
			By("Deleting all chaosexperiment")
			err = exec.Command("kubectl", "delete", "chaosexperiment", "-n", chaosTypes.ChaosNamespace, "--all").Run()
			Expect(err).To(BeNil(), "failed to delete chaosexperiment")
			if err != nil {
				fmt.Println(err)
			}

			fmt.Println("All chaosexperiment deleted successfully")

			//Deleting crds
			By("Delete chaosengine crd")
			err = exec.Command("kubectl", "delete", "-f", "https://raw.githubusercontent.com/litmuschaos/chaos-operator/master/deploy/chaos_crds.yaml").Run()
			Expect(err).To(BeNil(), "failed to delete crds")
			if err != nil {
				fmt.Println(err)
			}

			fmt.Println("crds deleted successfully")

			//Deleting rbacs
			By("Delete chaosengine rbac")
			err = exec.Command("kubectl", "delete", "-f", "https://raw.githubusercontent.com/litmuschaos/chaos-operator/master/deploy/rbac.yaml").Run()
			Expect(err).To(BeNil(), "failed to create rbac")
			if err != nil {
				fmt.Println(err)
			}

			fmt.Println("rbac deleted sucessfully")

		})

	})
})
