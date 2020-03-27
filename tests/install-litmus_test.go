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

//BDD Tests to Install Litmus
var _ = Describe("BDD of litmus installation", func() {

	// BDD TEST CASE 1
	Context("Check for the Litmus components", func() {

		It("Should check for creation of Litmus", func() {

			//Installing Crds
			By("Installing crds")
			err = exec.Command("kubectl", "apply", "-f", "https://raw.githubusercontent.com/litmuschaos/chaos-operator/master/deploy/chaos_crds.yaml").Run()
			Expect(err).To(BeNil(), "Failed to install crds")
			if err != nil {
				fmt.Println(err)
			}

			fmt.Println("crds Installed successfully")

			//Installing Rbac
			By("Installing rbac")
			err = exec.Command("kubectl", "apply", "-f", "https://raw.githubusercontent.com/litmuschaos/chaos-operator/master/deploy/rbac.yaml").Run()
			Expect(err).To(BeNil(), "Failed to install rbac")
			if err != nil {
				fmt.Println(err)
			}

			fmt.Println("rbac Installed successfully")
			fmt.Println("Installing Operator with image:", chaosTypes.OperatorRepoName, "/", chaosTypes.OperatorImage, ":", chaosTypes.OperatorImageTag)

			//Installing operator
			By("Installing operator")
			err = exec.Command("wget", "-O", "openebs-operator.yml", "https://raw.githubusercontent.com/litmuschaos/chaos-operator/master/deploy/operator.yaml").Run()
			Expect(err).To(BeNil(), "Failed to Fetch operator manifest")
			err = exec.Command("sed", "-i",
				`s/litmuschaos\/chaos-operator:ci/`+chaosTypes.OperatorRepoName+`\/`+chaosTypes.OperatorImage+`:`+chaosTypes.OperatorImageTag+`/g;
				 s/#  value: "litmuschaos\/chaos-runner:ci"/  value: "`+chaosTypes.RunnerRepoName+`\/`+chaosTypes.RunnerImage+`:`+chaosTypes.RunnerImageTag+`"/g;
			     s/#- name: CHAOS_RUNNER_IMAGE/- name: CHAOS_RUNNER_IMAGE/g`,
				"openebs-operator.yml").Run()
			Expect(err).To(BeNil(), "Failed to edit operator manifest")
			err = exec.Command("kubectl", "apply", "-f", "openebs-operator.yml").Run()
			Expect(err).To(BeNil(), "Failed to create chaos operator")

			fmt.Println("Runner Image:", chaosTypes.RunnerRepoName, "/", chaosTypes.RunnerImage, ":", chaosTypes.RunnerImageTag)

			//Checking the status of operator
			operator, _ := client.AppsV1().Deployments(chaosTypes.ChaosNamespace).Get("litmus", metav1.GetOptions{})
			count := 0
			for operator.Status.UnavailableReplicas != 0 {
				if count < 50 {
					fmt.Printf("Unavaliable Count: %v \n", operator.Status.UnavailableReplicas)
					operator, _ = client.AppsV1().Deployments(chaosTypes.ChaosNamespace).Get("litmus", metav1.GetOptions{})
					time.Sleep(5 * time.Second)
					count++
				} else {
					Fail("Operator is not in Ready state Time Out")
				}
			}
			fmt.Println("Chaos Operator created successfully")
			fmt.Println("Litmus installed successfully")
		})
	})

})
