package tests

import (
	"fmt"
	"os"
	"os/exec"
	"testing"
	"time"

	chaosTypes "github.com/litmuschaos/litmus-e2e/types"
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

//BDD Tests to check application cleanup
var _ = Describe("BDD of Application Cleanup", func() {

	// BDD TEST CASE 1
	Context("Checking for the application", func() {

		It("Should check for deletion of application, jobs and service", func() {

			//Removing Application
			var err error
			By("Deleting Application,Service and PVC")
			err = exec.Command("kubectl", "delete", "-f", "../nginx/nginx.yml").Run()
			Expect(err).To(BeNil(), "failed to delete application and its components")
			if err != nil {
				fmt.Println(err)
			}

			//Get the status of nginx Application
			app, err := client.AppsV1().Deployments(chaosTypes.ChaosNamespace).Get("nginx", metav1.GetOptions{})
			if err == nil {
				count := 0
				for app.Status.AvailableReplicas != 0 {
					if count < 50 {
						fmt.Printf("nginx Application is Deleting the current available count is: %v \n", app.Status.AvailableReplicas)
						app, _ = client.AppsV1().Deployments(chaosTypes.ChaosNamespace).Get("nginx", metav1.GetOptions{})
						time.Sleep(10 * time.Second)
						count++
					} else {
						Fail("nginx deletion failed Time Out")
					}
				}
			}

			fmt.Printf("Application deleted successfully")

			//Deleting All jobs
			By("Deleting all jobs")
			err = exec.Command("kubectl", "delete", "jobs", "-n", chaosTypes.ChaosNamespace, "--all").Run()
			Expect(err).To(BeNil(), "failed to delete jobs")
			if err != nil {
				fmt.Println(err)
			}

			fmt.Printf("Jobs deleted successfully")

			//Deleting All engine
			By("Deleting all jobs")
			err = exec.Command("kubectl", "delete", "chaosengine", "-n", chaosTypes.ChaosNamespace, "--all").Run()
			Expect(err).To(BeNil(), "failed to delete chaosengine")
			if err != nil {
				fmt.Println(err)
			}

			fmt.Printf("engines deleted successfully")

			//Deleting All experiment
			By("Deleting all experiment")
			err = exec.Command("kubectl", "delete", "chaosexperiment", "-n", chaosTypes.ChaosNamespace, "--all").Run()
			Expect(err).To(BeNil(), "failed to delete chaosexperiment")
			if err != nil {
				fmt.Println(err)
			}

			fmt.Printf("experiments deleted successfully")

			//Deleting chaos namespace
			By("Deleting chaos namespace")
			err = exec.Command("kubectl", "delete", "ns", chaosTypes.ChaosNamespace).Run()
			Expect(err).To(BeNil(), "failed to delete chaos namespace")
			if err != nil {
				fmt.Println(err)
			}
			fmt.Printf("chaosnamespace deleted successfully")

		})
	})

})
