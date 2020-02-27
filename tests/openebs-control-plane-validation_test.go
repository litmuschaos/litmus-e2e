package test

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

//BDD Tests for openebs pool container failure
var _ = Describe("BDD of openebs control plane chaos experiment", func() {

	// BDD TEST CASE 1
	Context("Check for the components of openebs", func() {

		It("Should check for creation of runner pod", func() {

			// Creating rbac for the experiment
			By("Creating rbac for the experiment")
			err = exec.Command("kubectl", "apply", "-f", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/openebs/openebs-control-plane-validation/rbac.yaml", "-n", "openebs").Run()
			Expect(err).To(BeNil(), "failed to create rbac for the experiment")
			if err != nil {
				fmt.Println(err)
			}

			// Creating Chaos-Experiment
			By("Creating Experiment")
			err = exec.Command("kubectl", "apply", "-f", "https://hub.litmuschaos.io/api/chaos?file=charts/openebs/openebs-control-plane-validation/experiment.yaml", "-n", "openebs").Run()
			Expect(err).To(BeNil(), "failed to create chaos experiment")
			if err != nil {
				fmt.Println(err)
			}

			// Creating Chaos Engine
			By("Creating Chaos Engine")
			err = exec.Command("kubectl", "apply", "-f", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/openebs/openebs-control-plane-validation/engine.yaml", "-n", "openebs").Run()
			Expect(err).To(BeNil(), "failed to create chaos engine")
			if err != nil {
				fmt.Println(err)
			}

			time.Sleep(5 * time.Second)

			fmt.Println("Chaosengine created successfully...")

			// Fetching engine-nginx-runner pod
			runner, err := client.CoreV1().Pods("openebs").Get("control-plane-chaos-runner", metav1.GetOptions{})
			fmt.Printf("name : %v \n", runner.Name)
			for i := 0; i < 30; i++ {
				if string(runner.Status.Phase) != "Succeeded" {
					time.Sleep(10 * time.Second)
					runner, _ = client.CoreV1().Pods("openebs").Get("control-plane-chaos-runner", metav1.GetOptions{})
					fmt.Printf("Currently the Runner pod is in %v State, Please Wait ...\n", runner.Status.Phase)
				} else {
					break
				}
			}
			Expect(err).To(BeNil())
			Expect(string(runner.Status.Phase)).To(Or(Equal("Running"), Equal("Succeeded")))

			// Checking the chaosresult
			By("Checking the chaosresult")
			app, _ := clientSet.ChaosResults("openebs").Get("control-plane-chaos-openebs-control-plane-validation", metav1.GetOptions{})
			Expect(string(app.Spec.ExperimentStatus.Verdict)).To(Equal("Pass"), "Verdict is not pass in chaosresult")
		})
	})

})
