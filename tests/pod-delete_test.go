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
	experimentName = "pod-delete"
	engineName     = "engine"
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

	//Getting the Application Status
	app, _ := client.AppsV1().Deployments(chaosTypes.ChaosNamespace).Get("nginx", metav1.GetOptions{})
	count := 0
	for app.Status.UnavailableReplicas != 0 {
		if count < 50 {
			fmt.Printf("Application is Creating, Currently Unavaliable Count is: %v \n", app.Status.UnavailableReplicas)
			app, _ = client.AppsV1().Deployments(chaosTypes.ChaosNamespace).Get("nginx", metav1.GetOptions{})
			time.Sleep(10 * time.Second)
			count++
		} else {
			Fail("Application fails to get in ready state")
		}
	}

})

//BDD Tests for pod-delete experiment
var _ = Describe("BDD of pod-delete experiment", func() {

	// BDD TEST CASE 1
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

			//Installing RBAC for the experiment
			rbacPath := "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-delete/rbac.yaml"
			rbacNamespace := chaosTypes.ChaosNamespace
			installrbac, err := utils.InstallRbac(rbacPath, rbacNamespace, experimentName, client)
			Expect(installrbac).To(Equal(0), "Fail to edit rbac file")
			Expect(err).To(BeNil(), "Fail to create RBAC")
			fmt.Println("Rbac has been created successfully !!!")

			//Creating Chaos-Experiment
			By("Creating Experiment")
			err = exec.Command("wget", "-O", "pod-delete.yaml", "https://hub.litmuschaos.io/api/chaos/master?file=charts/generic/pod-delete/experiment.yaml").Run()
			Expect(err).To(BeNil(), "fail get chaos experiment")
			err = exec.Command("sed", "-i", `s/litmuschaos\/ansible-runner:latest/`+chaosTypes.ExperimentRepoName+`\/`+chaosTypes.ExperimentImage+`:`+chaosTypes.ExperimentImageTag+`/g`, "pod-delete.yaml").Run()
			Expect(err).To(BeNil(), "fail to edit chaos experiment yaml")
			err = exec.Command("kubectl", "apply", "-f", "pod-delete.yaml", "-n", chaosTypes.ChaosNamespace).Run()
			Expect(err).To(BeNil(), "fail to create chaos experiment")
			fmt.Println("Chaos Experiment Created Successfully with image =", chaosTypes.ExperimentRepoName, "/", chaosTypes.ExperimentImage, ":", chaosTypes.ExperimentImageTag)

			//Installing chaos engine for the experiment
			//Fetching engine file
			By("Fetching engine file for the experiment")
			err = exec.Command("wget", "-O", experimentName+"-ce.yaml", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-delete/engine.yaml").Run()
			Expect(err).To(BeNil(), "Fail to fetch engine file")
			//Modify chaos engine spec
			//Modify Namespace,Name,AppNs,AppLabel of the engine

			err = exec.Command("sed", "-i",
				`s/namespace: default/namespace: litmus/g;
			         s/name: nginx-chaos/name: `+engineName+`/g;
					 s/appns: 'default'/appns: 'litmus'/g;
					 s/jobCleanUpPolicy: 'delete'/jobCleanUpPolicy: 'retain'/g;
					 s/annotationCheck: 'true'/annotationCheck: 'false'/g;
			         s/applabel: 'app=nginx'/applabel: 'run=nginx'/g`,
				experimentName+"-ce.yaml").Run()

			//Modify FORCE
			err = exec.Command("sed", "-i", `/name: FORCE/{n;s/.*/              value: ""/}`, experimentName+"-ce.yaml").Run()
			Expect(err).To(BeNil(), "Fail to Modify FORCE field of chaos engine")

			//Creating ChaosEngine
			By("Creating ChaosEngine")
			err = exec.Command("kubectl", "apply", "-f", experimentName+"-ce.yaml", "-n", chaosTypes.ChaosNamespace).Run()
			Expect(err).To(BeNil(), "Fail to create chaos engine")
			if err != nil {
				fmt.Println(err)
			}

			fmt.Println("ChaosEngine created successfully...")
			time.Sleep(2 * time.Second)

			//Fetching the runner pod and Checking if it get in Running state or not
			By("Wait for runner pod to come in running sate")
			runnerNamespace := chaosTypes.ChaosNamespace
			runnerPodStatus, err := utils.RunnerPodStatus(runnerNamespace, engineName, client)
			Expect(runnerPodStatus).NotTo(Equal("1"), "Runner pod failed to get in running state")
			Expect(err).To(BeNil(), "Fail to get the runner pod")
			fmt.Println("Runner pod for is in Running state")

			//Waiting for experiment job to get completed
			//Also Printing the logs of the experiment
			By("Waiting for job completion")
			jobNamespace := chaosTypes.ChaosNamespace
			jobPodLogs, err := utils.JobLogs(experimentName, jobNamespace, engineName, client)
			Expect(jobPodLogs).To(Equal(0), "Fail to print the logs of the experiment")
			Expect(err).To(BeNil(), "Fail to get the experiment job pod")

			//Checking the chaosresult
			By("Checking the chaosresult")
			chaosResult, err := clientSet.ChaosResults(chaosTypes.ChaosNamespace).Get(engineName+"-"+experimentName, metav1.GetOptions{})
			fmt.Println("Chaos Result Verdict is: ", chaosResult.Status.ExperimentStatus.Verdict)
			Expect(err).To(BeNil(), "Fail to get chaosresult")
			Expect(string(chaosResult.Status.ExperimentStatus.Verdict)).To(Equal("Pass"), "Chaos Result Verdict is not Pass")

		})
	})
	// BDD for checking chaosengine Verdict
	Context("Check for chaos engine verdict", func() {

		It("Should check for the verdict of experiment", func() {

			By("Checking the Verdict of Chaos Experiment")
			time.Sleep(10 * time.Second)
			chaosEngine, err := clientSet.ChaosEngines(chaosTypes.ChaosNamespace).Get(engineName, metav1.GetOptions{})
			Expect(err).To(BeNil(), "Fail to get the chaosengine")
			fmt.Println("Chaos Engine Verdict is: ", chaosEngine.Status.Experiments[0].Verdict)
			Expect(string(chaosEngine.Status.Experiments[0].Verdict)).To(Equal("Pass"), "Chaos Engine Verdict is not Pass")
		})
	})

	// BDD for pipeline result update
	Context("Check for the result update", func() {

		It("Should check for the result updation", func() {

			//Updating the result table
			By("Updating the result table")
			chaosEngine, err := clientSet.ChaosEngines(chaosTypes.ChaosNamespace).Get(engineName, metav1.GetOptions{})
			Expect(err).To(BeNil(), "Fail to get the chaosengine while updating the result in a table")
			testVerdict := string(chaosEngine.Status.Experiments[0].Verdict)
			err = utils.UpdateResultTable(experimentName, testVerdict, engineName, clientSet)
			Expect(err).To(BeNil(), "Fail run the script for result updation")
			fmt.Println("Result updated successfully !!!")
		})
	})
})
