package tests

import (
	"fmt"
	"os"
	"os/exec"
	"testing"
	"time"

	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	chaosClient "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus-e2e/pkg/utils"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	scheme "k8s.io/client-go/kubernetes/scheme"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	restclient "k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

var (
	kubeconfig     string
	config         *restclient.Config
	client         *kubernetes.Clientset
	clientSet      *chaosClient.LitmuschaosV1alpha1Client
	err            error
	image_tag      = os.Getenv("IMAGE_TAG")
	experimentName = "coredns-pod-delete"
	engineName     = "engine-coredns"
	chaosNamespace = "kube-system"
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

//BDD Tests for coreDNS pod delete
var _ = Describe("BDD of coreDNS pod delete experiment", func() {

	// BDD TEST CASE 1
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

			//Installing RBAC for the experiment
			rbacPath := "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/coredns/coredns-pod-delete/rbac.yaml"
			installrbac, err := utils.InstallRbac(rbacPath, experimentName, client)
			Expect(installrbac).To(Equal(0), "Fail to create rbac file")
			Expect(err).To(BeNil(), "Fail to create RBAC")
			fmt.Println("Rbac has been created successfully !!!")

			//Creating Chaos-Experiment
			By("Creating Experiment")
			err = exec.Command("kubectl", "apply", "-f", "https://hub.litmuschaos.io/api/chaos?file=charts/coredns/coredns-pod-delete/experiment.yaml", "-n", chaosNamespace).Run()
			Expect(err).To(BeNil(), "fail to create chaos experiment")
			fmt.Println("Chaos Experiment Created Successfully")

			//Creating ChaosEngine
			By("Creating ChaosEngine")
			err = exec.Command("kubectl", "apply", "-f", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/coredns/coredns-pod-delete/engine.yaml", "-n", chaosNamespace).Run()
			Expect(err).To(BeNil(), "Fail to create chaos engine")
			if err != nil {
				fmt.Println(err)
			}

			fmt.Println("ChaosEngine created successfully...")
			time.Sleep(2 * time.Second)

			//Fetching the runner pod and Checking if it get in Running state or not
			By("Wait for engine to come in running sate")
			runner, err := client.CoreV1().Pods(chaosNamespace).Get(engineName+"-runner", metav1.GetOptions{})
			fmt.Printf("name : %v \n", runner.Name)

			//Running it for infinite time (say 3000 * 10)
			//The Gitlab job will quit if it takes more time than default time (10 min)
			for i := 0; i < 3000; i++ {
				if string(runner.Status.Phase) != "Running" {
					time.Sleep(1 * time.Second)
					runner, _ = client.CoreV1().Pods(chaosNamespace).Get(engineName+"-runner", metav1.GetOptions{})
					Expect(string(runner.Status.Phase)).NotTo(Or(Equal("Succeeded"), Equal("")))
					fmt.Printf("The Runner pod is in %v State \n", runner.Status.Phase)
				} else {
					break
				}
			}

			Expect(err).To(BeNil(), "Fail to get the runner pod")
			Expect(string(runner.Status.Phase)).To(Equal("Running"))

			//Waiting for experiment job to get completed
			//Also Printing the logs of the experiment
			By("Waiting for job completion")
			jobPodLogs, err := utils.JobLogs(experimentName, engineName, client)
			Expect(jobPodLogs).To(Equal(0), "Fail to print the logs of the experiment")
			Expect(err).To(BeNil(), "Fail to get the experiment job pod")

			//Checking the chaosresult
			By("Checking the chaosresult")
			app, err := clientSet.ChaosResults(chaosNamespace).Get(engineName+"-"+experimentName, metav1.GetOptions{})
			testVerdict := string(app.Status.ExperimentStatus.Verdict)
			Expect(testVerdict).To(Equal("Pass"), "Verdict is not pass chaosresult")
			Expect(err).To(BeNil(), "Fail to get chaosresult")
		})
	})

	// BDD for pipeline result update
	Context("Check for the result update", func() {

		It("Should check for the result updation", func() {

			//Updating the result table
			By("Updating the result table")
			jobResult, err := utils.ResultUpdate(experimentName, engineName, clientSet)
			Expect(jobResult).NotTo(Equal("1"), "Failed  to update the job result in a table")
			Expect(err).To(BeNil(), "Fail run the script for result updation")
			fmt.Println("Result updated successfully !!!")
		})
	})

})
