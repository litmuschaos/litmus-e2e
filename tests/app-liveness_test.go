package tests

import (
	"fmt"
	"os"
	"os/exec"
	"testing"

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

//BDD Tests to check application deployment
var _ = Describe("BDD of Application Deployment", func() {

	// BDD TEST CASE 1
	Context("Check for the application", func() {

		It("Should check for creation of liveness pod", func() {

			//Deploying liveness for application
			var err error
			By("Deploying liveness pod for the applicaiton")
			err = exec.Command("kubectl", "apply", "-f", "../nginx/liveness.yml").Run()
			Expect(err).To(BeNil(), "failed to create the liveness for application")
			if err != nil {
				fmt.Println(err)
			}

			//Get the status of liveness pod
			PodList, err := client.CoreV1().Pods(chaosTypes.ChaosNamespace).List(metav1.ListOptions{LabelSelector: "run=liveness-app"})
			Expect(err).To(BeNil(), "failed to get the list of pod")
			//Getting the pod from jobList after 10s of wait
			for _, pod := range PodList.Items {
				if string(pod.Status.Phase) != "Running" {
					fmt.Printf("Currently, the experiment job pod is in %v State, Please Wait ...\n", pod.Status.Phase)
				} else {
					Expect(string(pod.Status.Phase)).To(Equal("Running"))
					break
				}
			}
			fmt.Println("Liveness pod established successfully !!!")

		})
	})

})
