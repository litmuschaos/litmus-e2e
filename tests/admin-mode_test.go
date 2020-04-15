package tests

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"testing"
	"time"

	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	chaosClient "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus-e2e/pkg/utils"
	chaosTypes "github.com/litmuschaos/litmus-e2e/types"
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
	experimentName = "pod-delete-admin-test"
	engineName     = "adminengine"
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

	//Checking the status of operator which is already installed and running
	operator, err := client.AppsV1().Deployments(chaosTypes.ChaosNamespace).Get("litmus", metav1.GetOptions{})
	Expect(err).To(BeNil(), "Failed to get operator")
	count := 0
	for operator.Status.UnavailableReplicas != 0 {
		if count < 50 {
			fmt.Printf("Unavaliable Count: %v \n", operator.Status.UnavailableReplicas)
			operator, err = client.AppsV1().Deployments(chaosTypes.ChaosNamespace).Get("litmus", metav1.GetOptions{})
			Expect(err).To(BeNil(), "Failed to get operator")
			time.Sleep(5 * time.Second)
			count++
		} else {
			Fail("Operator is not in Ready state Time Out")
		}
	}
	fmt.Println("Chaos Operator is up and Running")
})

//BDD Tests for testing admin mode functionality
//Checking for the creation of runner pod for application in same namespace
var _ = Describe("BDD of operator reconcile resiliency check", func() {

	// BDD TEST CASE 1
	// All Litmus components are in litmus namespace and application pod is in defalt ns
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

			//Creating application for pod-delete in default namespace
			By("Creating deployment for pod-delete chaos")
			err = exec.Command("kubectl", "run", "adminapp", "--image=nginx").Run()
			Expect(err).To(BeNil(), "Failed to create deployment")
			fmt.Println("Test Application is created")

			//Installing RBAC for experiment that is pod-delete
			rbacPath := "https://raw.githubusercontent.com/litmuschaos/pages/master/docs/litmus-admin-rbac.yaml"
			err = exec.Command("wget", "-O", "admin-rbac-sa.yaml", rbacPath).Run()
			Expect(err).To(BeNil(), "Fail to fetch rbac")
			err = exec.Command("sed", "-i",
				`s/namespace: litmus/namespace: `+chaosTypes.ChaosNamespace+`/g`,
				"admin-rbac-sa.yaml").Run()
			Expect(err).To(BeNil(), "Fail to modify rbac")
			err = exec.Command("kubectl", "apply", "-f", "admin-rbac-sa.yaml", "-n", chaosTypes.ChaosNamespace).Run()
			Expect(err).To(BeNil(), "Fail to create RBAC")
			fmt.Println("Rbac has been created successfully !!!")

			//Creating Chaos-Experiment for pod delete
			By("Creating Experiment for pod delete")
			err = exec.Command("wget", "-O", "admin-pod-delete.yaml", "https://hub.litmuschaos.io/api/chaos/master?file=charts/generic/pod-delete/experiment.yaml").Run()
			Expect(err).To(BeNil(), "fail to get chaos experiment")
			err = exec.Command("sed", "-i",
				`s/litmuschaos\/ansible-runner:latest/`+chaosTypes.ExperimentRepoName+`\/`+chaosTypes.ExperimentImage+`:`+chaosTypes.ExperimentImageTag+`/g;
			     s/name: pod-delete/name: `+experimentName+`/g`,
				"admin-pod-delete.yaml").Run()
			Expect(err).To(BeNil(), "Failed to edit chaos experiment yaml")
			err = exec.Command("kubectl", "apply", "-f", "admin-pod-delete.yaml", "-n", chaosTypes.ChaosNamespace).Run()
			Expect(err).To(BeNil(), "Failed to create chaos experiment")
			fmt.Println("Pod delete Chaos Experiment Created Successfully")

			//Installing chaos engine for the experiment
			//Fetching engine file
			By("Fetching engine file for pod delete experiment")
			err = exec.Command("wget", "-O", experimentName+"-ce.yaml", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-delete/engine.yaml").Run()
			Expect(err).To(BeNil(), "Failed to fetch engine file for pod delete")

			//Modify chaos engine spec
			//Modify Namespace,Name,AppNs,AppLabel of the engine
			err = exec.Command("sed", "-i",
				`s/name: nginx-chaos/name: `+engineName+`/g;
				 s/namespace: default/namespace: `+chaosTypes.ChaosNamespace+`/g;
				 s/chaosServiceAccount: pod-delete-sa/chaosServiceAccount: litmus-admin/g;
				 s/name: pod-delete/name: `+experimentName+`/g;
			     s/jobCleanUpPolicy: 'delete'/jobCleanUpPolicy: 'retain'/g;
			     s/annotationCheck: 'true'/annotationCheck: 'false'/g;
			     s/applabel: 'app=nginx'/applabel: 'run=adminapp'/g`,
				experimentName+"-ce.yaml").Run()
			//Modify FORCE
			err = exec.Command("sed", "-i", `/name: FORCE/{n;s/.*/              value: ""/}`, experimentName+"-ce.yaml").Run()
			Expect(err).To(BeNil(), "Failed to Modify FORCE field of chaos engine")

			//Creating ChaosEngine
			By("Creating ChaosEngine")
			err = exec.Command("kubectl", "apply", "-f", experimentName+"-ce.yaml", "-n", chaosTypes.ChaosNamespace).Run()
			Expect(err).To(BeNil(), "Failed to create chaos engine")
			fmt.Println("ChaosEngine for pod delete created successfully")
			time.Sleep(2 * time.Second)

			//Fetching the runner pod and Checking if it gets in Running state or not
			By("Wait for runner pod to come in running sate")
			runnerPodStatus, err := utils.RunnerPodStatus(chaosTypes.ChaosNamespace, engineName, client)
			Expect(runnerPodStatus).NotTo(Equal("1"), "Faileded to get in running state")
			Expect(err).To(BeNil(), "Failed to get the runner pod")
			fmt.Println("Runner pod for pod delete is in Running state")

			//Waiting for experiment job to get completed
			//Also Printing the logs of the experiment
			By("Waiting for job completion")
			jobPodLogs, err := utils.JobLogs(experimentName, chaosTypes.ChaosNamespace, engineName, client)
			Expect(jobPodLogs).To(Equal(0), "Failed to print the logs of the experiment")
			Expect(err).To(BeNil(), "Failed to get the experiment job pod")

			//Checking the chaosresult
			By("Checking the chaosresult")
			chaosResult, err := clientSet.ChaosResults(chaosTypes.ChaosNamespace).Get(engineName+"-"+"pod-delete", metav1.GetOptions{})
			Expect(string(chaosResult.Status.ExperimentStatus.Verdict)).To(Equal("Pass"), "Verdict is not pass chaosresult")
			Expect(err).To(BeNil(), "Failed to get chaosresult")
		})
	})
	// BDD TEST CASE 2
	// Operator in litmus ns, engine and experiment is in test ns
	// Application is in deafult ns
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

			//Create Namespace for the test
			By("Creating namespace for the test")
			cmd := exec.Command("kubectl", "create", "ns", "test")
			cmd.Stderr = os.Stderr
			err := cmd.Run()
			if err != nil {
				log.Fatalf("cmd.Run() failed with %s\n", err)
			}

			//Installing RBAC for experiment that is pod-delete
			rbacPath := "https://raw.githubusercontent.com/litmuschaos/pages/master/docs/litmus-admin-rbac.yaml"
			err = exec.Command("wget", "-O", "admin-pod-delete-sa.yaml", rbacPath).Run()
			Expect(err).To(BeNil(), "Fail to fetch rbac")
			err = exec.Command("sed", "-i",
				`s/namespace: litmus/namespace: test/g`,
				"admin-pod-delete-sa.yaml").Run()
			err = exec.Command("kubectl", "apply", "-f", "admin-pod-delete-sa.yaml").Run()
			Expect(err).To(BeNil(), "Fail to create RBAC")
			fmt.Println("Rbac has been created successfully !!!")

			//Creating Chaos-Experiment for pod delete
			By("Creating Experiment for pod delete")
			err = exec.Command("wget", "-O", "admin-pod-delete.yaml", "https://hub.litmuschaos.io/api/chaos/master?file=charts/generic/pod-delete/experiment.yaml").Run()
			Expect(err).To(BeNil(), "fail to get chaos experiment")
			err = exec.Command("sed", "-i",
				`s/litmuschaos\/ansible-runner:latest/`+chaosTypes.ExperimentRepoName+`\/`+chaosTypes.ExperimentImage+`:`+chaosTypes.ExperimentImageTag+`/g;
			     s/name: pod-delete/name: `+experimentName+`/g`,
				"admin-pod-delete.yaml").Run()
			Expect(err).To(BeNil(), "Failed to edit chaos experiment yaml")
			err = exec.Command("kubectl", "apply", "-f", "admin-pod-delete.yaml", "-n", "test").Run()
			Expect(err).To(BeNil(), "Failed to create chaos experiment")
			fmt.Println("Pod delete Chaos Experiment Created Successfully")

			//Installing chaos engine for the experiment
			//Fetching engine file
			By("Fetching engine file for pod delete experiment")
			err = exec.Command("wget", "-O", experimentName+"-ce.yaml", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-delete/engine.yaml").Run()
			Expect(err).To(BeNil(), "Failed to fetch engine file for pod delete")

			//Modify chaos engine spec
			//Modify Namespace,Name,AppNs,AppLabel of the engine
			err = exec.Command("sed", "-i",
				`s/name: nginx-chaos/name: `+engineName+`/g;
				 s/namespace: default/namespace: test/g;
				 s/name: pod-delete/name: `+experimentName+`/g;
				 s/chaosServiceAccount: pod-delete-sa/chaosServiceAccount: litmus-admin/g;
				 s/jobCleanUpPolicy: 'delete'/jobCleanUpPolicy: 'retain'/g;
				 s/annotationCheck: 'true'/annotationCheck: 'false'/g;
			     s/applabel: 'app=nginx'/applabel: 'run=adminapp'/g`,
				experimentName+"-ce.yaml").Run()
			//Modify FORCE
			err = exec.Command("sed", "-i", `/name: FORCE/{n;s/.*/              value: ""/}`, experimentName+"-ce.yaml").Run()
			Expect(err).To(BeNil(), "Failed to Modify FORCE field of chaos engine")

			//Creating ChaosEngine
			By("Creating ChaosEngine")
			err = exec.Command("kubectl", "apply", "-f", experimentName+"-ce.yaml").Run()
			Expect(err).To(BeNil(), "Failed to create chaos engine")
			fmt.Println("ChaosEngine for pod delete created successfully")
			time.Sleep(2 * time.Second)

			//Fetching the runner pod and Checking if it gets in Running state or not
			By("Wait for runner pod to come in running sate")
			runnerNamespace := "test"
			runnerPodStatus, err := utils.RunnerPodStatus(runnerNamespace, engineName, client)
			Expect(runnerPodStatus).NotTo(Equal("1"), "Failed to get the runner pod in running state")
			Expect(err).To(BeNil(), "Failed to get the runner pod")
			fmt.Println("Runner pod for pod delete is in Running state")

			//Waiting for experiment job to get completed
			//Also Printing the logs of the experiment
			By("Waiting for job completion")
			jobNamespace := "test"
			jobPodLogs, err := utils.JobLogs(experimentName, jobNamespace, engineName, client)
			Expect(jobPodLogs).To(Equal(0), "Failed to print the logs of the experiment")
			Expect(err).To(BeNil(), "Failed to get the experiment job pod")

			//Checking the chaosresult
			By("Checking the chaosresult")
			chaosResult, err := clientSet.ChaosResults("test").Get(engineName+"-"+"pod-delete", metav1.GetOptions{})
			Expect(string(chaosResult.Status.ExperimentStatus.Verdict)).To(Equal("Pass"), "Verdict is not pass chaosresult")
			Expect(err).To(BeNil(), "Failed to get chaosresult")
		})
	})

})
