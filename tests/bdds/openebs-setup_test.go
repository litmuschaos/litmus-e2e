package set

import (
	"fmt"
	"os"
	"os/exec"
	"testing"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
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

//BDD Tests to check secondary resources
var _ = Describe("BDD of openebs experiment", func() {

	// BDD TEST CASE 1
	Context("Check for the custom resources", func() {

		It("Should check for creation of runner pod", func() {

			//Get OpenEBS Chaos Charts
			var err error
			By("Installing OpenEBS Charts")
			err = exec.Command("wget", "https://openebs.github.io/charts/openebs-operator-1.2.0.yaml").Run()
			Expect(err).To(BeNil(), "failed to install OpenEBS Charts")
			if err != nil {
				fmt.Println(err)
			}
			fmt.Println("Get OpenEBS Chaos Charts")

			//Changing the required field
			By("Changing the required field")
			err = exec.Command("sed", "-i", "157 s/false/true/", "openebs-operator-1.2.0.yaml").Run()
			Expect(err).To(BeNil(), "failed to make changes in OpenEBS Charts")
			if err != nil {
				fmt.Println(err)
			}
			fmt.Println("Edit the required fields in chaos charts")

			//Creating Pools
			By("Creating OpenEBs Pool")
			err = exec.Command("kubectl", "apply", "-f", "openebs-operator-1.2.0.yaml").Run()
			Expect(err).To(BeNil(), "failed to Create OpenEBS pool")
			if err != nil {
				fmt.Println(err)
			}
			fmt.Println("OpenEBS pools successfully Created")

			// Checking status of OpenEBS Pods
			f := 0

			for i := 0; i < 60; i++ {
				f = 0
				totalPods, _ := client.CoreV1().Pods("openebs").List(metav1.ListOptions{})

				for _, v := range totalPods.Items {
					if v.Status.Phase != "Running" {
						f = 1
						break
					}
				}
				if f == 0 {
					break
				}
				time.Sleep(5 * time.Second)
			}

			if f == 0 {
				fmt.Printf("All openebs pods are in running state\n")
			} else {
				Fail("OpenEBS Pods are not in Running state Time out")
			}

			fmt.Println("Openebs Installed successfully")

		})
	})

})
