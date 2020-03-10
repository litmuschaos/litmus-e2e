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

//BDD Tests to check application deployment
var _ = Describe("BDD of Application Deployment", func() {

	// BDD TEST CASE 1
	Context("Check for the application", func() {

		It("Should check for creation of application", func() {

			//Deploying nginx application
			By("Deploying nginx Application")
			err = exec.Command("kubectl", "apply", "-f", "../nginx/nginx.yml").Run()
			Expect(err).To(BeNil(), "failed to create the application")
			if err != nil {
				fmt.Println(err)
			}

			//Get the status of nginx Application
			app, _ := client.AppsV1().Deployments(chaosTypes.ChaosNamespace).Get("nginx", metav1.GetOptions{})
			count := 0
			for app.Status.UnavailableReplicas != 0 {
				if count < 30 {
					fmt.Printf("nginx is getting ready, Currently the Unavaliable Count is: %v \n", app.Status.UnavailableReplicas)
					app, _ = client.AppsV1().Deployments(chaosTypes.ChaosNamespace).Get("nginx", metav1.GetOptions{})
					time.Sleep(10 * time.Second)
					count++
				} else {
					Fail("Litmus Installation Failed Time Out")
				}
			}

			fmt.Printf("Application installed successfully")

		})
	})

})
