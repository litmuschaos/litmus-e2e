package tests

import (
	"fmt"
	"os"
	"os/exec"
	"strconv"
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
	kubeconfig        string
	config            *restclient.Config
	client            *kubernetes.Clientset
	clientSet         *chaosClient.LitmuschaosV1alpha1Client
	err               error
	containerIdBefore [9]string
	experimentName    = "openebs-pool-container-failure"
	engineName        = "engine"
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
	app, _ := client.AppsV1().Deployments(chaosTypes.ChaosNamespace).Get("percona", metav1.GetOptions{})
	count := 0
	for app.Status.UnavailableReplicas != 0 {
		if count < 50 {
			fmt.Printf("Percona Application is Creating, Currently Unavaliable Count is: %v \n", app.Status.UnavailableReplicas)
			app, _ = client.AppsV1().Deployments(chaosTypes.ChaosNamespace).Get("percona", metav1.GetOptions{})
			time.Sleep(10 * time.Second)
			count++
		} else {
			Fail("Application fails to get in ready state")
		}
	}

})

//BDD Tests for openebs pool container failure
var _ = Describe("BDD of openebs pool container failure experiment", func() {

	// BDD TEST CASE 1
	resourceVersionSumBefore := 0
	containerDetailsBefore := make(map[string][]interface{})

	Context("Check for the components of openebs", func() {

		It("Should check for creation of runner pod", func() {

			//Getting the Sum of Resource Version before Chaos
			csp, err := client.CoreV1().Pods(chaosTypes.CspPodNs).List(metav1.ListOptions{LabelSelector: chaosTypes.CspPodLabels})
			Expect(err).To(BeNil(), "fail to get csp pods")
			for _, podSpec := range csp.Items {
				rv, _ := strconv.Atoi(podSpec.ResourceVersion)
				resourceVersionSumBefore = resourceVersionSumBefore + rv
			}

			fmt.Println("Resource Version before chaos has been recorded")

			//Getting the ContainerIDs of CSP pod Containers and Sum of Container Restart Count
			containerCount := 0
			for _, podSpec := range csp.Items {
				for i := 0; i < len(podSpec.Status.ContainerStatuses); i++ {
					containerIdBefore[containerCount] = (podSpec.Status.ContainerStatuses[i].ContainerID)
					containerDetailsBefore[podSpec.Status.ContainerStatuses[i].Name] = append(containerDetailsBefore[podSpec.Status.ContainerStatuses[i].Name], int(podSpec.Status.ContainerStatuses[i].RestartCount))
					containerCount++
				}
			}

			fmt.Println("ContainerIDs before chaos has been recorded")
			fmt.Println("Container Restart count before chaos has been recorded")

			//Installing RBAC for the experiment

			rbacPath := "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/openebs/openebs-pool-container-failure/rbac.yaml"
			installrbac, err := utils.InstallRbac(rbacPath, experimentName, client)
			Expect(installrbac).To(Equal(0), "Fail to create rbac file")
			Expect(err).To(BeNil(), "Fail to create RBAC")
			fmt.Println("Rbac has been created successfully !!!")

			//Creating Chaos-Experiment
			By("Creating Experiment")
			err = exec.Command("kubectl", "apply", "-f", "https://hub.litmuschaos.io/api/chaos?file=charts/openebs/openebs-pool-container-failure/experiment.yaml", "-n", chaosTypes.ChaosNamespace).Run()
			err = exec.Command("wget", "-O", "pool-container-failure-ce.yaml", "https://hub.litmuschaos.io/api/chaos?file=charts/openebs/openebs-pool-container-failure/experiment.yaml").Run()
			Expect(err).To(BeNil(), "fail get chaos experiment")
			err = exec.Command("sed", "-i", `s/ansible-runner:latest/ansible-runner:ci/g`, "pool-container-failure-ce.yaml").Run()
			Expect(err).To(BeNil(), "fail to edit chaos experiment yaml")
			err = exec.Command("kubectl", "apply", "-f", "pool-container-failure-ce.yaml", "-n", "litmus").Run()
			Expect(err).To(BeNil(), "fail to create chaos experiment")

			fmt.Println("Chaos Experiment Created Successfully")

			//Installing chaos engine for the experiment
			//Fetching engine file
			By("Fetching engine file for the experiment")
			err = exec.Command("wget", "-O", "pool-container-failure-ce.yaml", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/openebs/openebs-pool-container-failure/engine.yaml").Run()
			Expect(err).To(BeNil(), "Fail to fetch engine file")
			//Modify chaos engine spec
			//Modify Namespace,Name,AppNs,AppLabel of the engine

			err = exec.Command("sed", "-i",
				`s/namespace: default/namespace: litmus/g;
			         s/name: target-chaos/name: engine/g;
					 s/appns: 'default'/appns: 'litmus'/g;
					 s/jobCleanUpPolicy: 'delete'/jobCleanUpPolicy: 'retain'/g;
			         s/applabel: 'app=nginx'/applabel: 'name=percona'/g`,
				"pool-container-failure-ce.yaml").Run()

			Expect(err).To(BeNil(), "Fail to change the fields of the engine")
			//Modify APP_PVC
			err = exec.Command("sed", "-i", `/name: APP_PVC/{n;s/.*/              value: "percona-vol1-claim"/}`, "pool-container-failure-ce.yaml").Run()
			Expect(err).To(BeNil(), "Fail to Modify APP PVC name in engine spec")

			//Creating ChaosEngine
			By("Creating ChaosEngine")
			err = exec.Command("kubectl", "apply", "-f", "pool-container-failure-ce.yaml", "-n", chaosTypes.ChaosNamespace).Run()
			Expect(err).To(BeNil(), "Fail to create chaos engine")
			if err != nil {
				fmt.Println(err)
			}

			fmt.Println("ChaosEngine created successfully...")
			time.Sleep(2 * time.Second)

			//Fetching the runner pod and Checking if it get in Running state or not
			By("Wait for engine to come in running sate")
			runner, err := client.CoreV1().Pods(chaosTypes.ChaosNamespace).Get(engineName+"-runner", metav1.GetOptions{})
			fmt.Printf("name : %v \n", runner.Name)
			//Running it for infinite time (say 3000 * 10)
			//The Gitlab job will quit if it takes more time than default time (10 min)
			for i := 0; i < 3000; i++ {
				if string(runner.Status.Phase) != "Running" {
					time.Sleep(1 * time.Second)
					runner, _ = client.CoreV1().Pods(chaosTypes.ChaosNamespace).Get(engineName+"-runner", metav1.GetOptions{})
					Expect(string(runner.Status.Phase)).NotTo(Or(Equal("Succeeded"), Equal("")))
					fmt.Printf("The Runner pod is in %v State \n", runner.Status.Phase)
				} else {
					break
				}
			}
			Expect(err).To(BeNil(), "Fail to get the runner pod")
			Expect(string(runner.Status.Phase)).To(Equal("Running"))

			//Fetch job pod name
			By("Fetch Job pod name")
			jobPodLogs, err := utils.JobLogs(experimentName, engineName, client)
			Expect(jobPodLogs).To(Equal(0), "Fail to print the logs of the experiment")
			Expect(err).To(BeNil(), "Fail to get the experiment job pod")

			//Running it for infinite time (say 30000s)
			//The Gitlab job will quit if it takes more time than default time (10 min)
			By("Wait for engine to come in Succeeded sate")
			runnerAfter, err := client.CoreV1().Pods(chaosTypes.ChaosNamespace).Get(engineName+"-runner", metav1.GetOptions{})
			for i := 0; i < 3000; i++ {
				if string(runnerAfter.Status.Phase) != "Succeeded" {
					time.Sleep(10 * time.Second)
					runnerAfter, _ = client.CoreV1().Pods(chaosTypes.ChaosNamespace).Get(engineName+"-runner", metav1.GetOptions{})
					fmt.Printf("Currently, the runner pod is in %v State, Please Wait ...\n", runnerAfter.Status.Phase)
				} else {
					break
				}
			}
			Expect(err).To(BeNil())
			Expect(string(runnerAfter.Status.Phase)).To(Equal("Succeeded"))

			//Checking the chaosresult
			By("Checking the chaosresult")
			app, _ := clientSet.ChaosResults(chaosTypes.ChaosNamespace).Get("engine-openebs-pool-container-failure", metav1.GetOptions{})
			Expect(string(app.Spec.ExperimentStatus.Verdict)).To(Equal("Pass"), "Verdict is not pass chaosresult")

		})
	})
	//Matching the Resource Verison after Chaos
	Context("Check Resource Version of pool container", func() {

		It("Should check for the change in Resource Version after Chaos", func() {

			podDetails := chaosTypes.PodDetails{}
			podDetails.PodNamespace = chaosTypes.CspPodNs
			podDetails.PodLabel = chaosTypes.CspPodLabels
			resourceVersion, err := utils.ComparePodResourceVersion(resourceVersionSumBefore, podDetails, client)
			Expect(resourceVersion).NotTo(Equal(0), "The Resource Version does not change")
			Expect(err).To(BeNil(), "Fail to get the pods")
			fmt.Println("Resource Version changed !!!")
		})
	})

	//Matching the ContainerIDs after Chaos
	Context("Check ContainerIDs after chaos", func() {

		It("Should check for the change in ContainerIDs of csp pod", func() {

			podDetails := chaosTypes.PodDetails{}
			podDetails.PodNamespace = chaosTypes.CspPodNs
			podDetails.PodLabel = chaosTypes.CspPodLabels
			containerid, err := utils.CompareContainerID(containerIdBefore, podDetails, client)
			Expect(containerid).NotTo(Equal(false), "The Container ID does not change")
			Expect(err).To(BeNil(), "Fail to get the pods")
			fmt.Println("Container ID Changed !!!")
		})
	})

	//Matching the Container Restart Count after Chaos
	Context("Check Container Restart Count", func() {

		It("Should check for the change in Container Restart Count after Chaos", func() {

			containerName := "cstor-pool-mgmt"
			podDetails := chaosTypes.PodDetails{}
			podDetails.PodNamespace = chaosTypes.CspPodNs
			podDetails.PodLabel = chaosTypes.CspPodLabels
			containerRC, err := utils.CompareContainerRestartCount(containerDetailsBefore, containerName, podDetails, client)
			Expect(containerRC).NotTo(Equal(true), "The restart count does not change")
			Expect(err).To(BeNil(), "Fail to get the pods")
			fmt.Println("The Restart count changed !!!")

		})
	})

})
