package tests

import (
	"fmt"
	"os"
	"os/exec"
	"strconv"
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
	"github.com/litmuschaos/litmus-e2e/pkg/utils"
	restclient "k8s.io/client-go/rest"
)

var (
	kubeconfig        string
	config            *restclient.Config
	client            *kubernetes.Clientset
	clientSet         *chaosClient.LitmuschaosV1alpha1Client
	err               error
	containerIdBefore [9]string
	startedAtBefore   [9]metav1.Time
	experimentName    = "openebs-target-container-failure"
	engineName        = "engine3"
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
			fmt.Printf("Percona is Creating, Currently Unavaliable Count is: %v \n", app.Status.UnavailableReplicas)
			app, _ = client.AppsV1().Deployments(chaosTypes.ChaosNamespace).Get("percona", metav1.GetOptions{})
			time.Sleep(10 * time.Second)
			count++
		} else {
			Fail("Application fails to get in ready state")
		}
	}

})

//BDD Tests to check secondary resources
var _ = Describe("BDD of openebs experiment", func() {

	// BDD TEST CASE 1
	resourceVersionBefore := 0
	containerDetailsBefore := make(map[string][]interface{})

	Context("Check for the custom resources", func() {

		It("Should check for creation of runner pod", func() {

			//Getting the Sum of Resource Version before Chaos
			target, err := client.CoreV1().Pods(chaosTypes.TargetPodNs).List(metav1.ListOptions{LabelSelector: chaosTypes.TargetPodLabels})
			Expect(err).To(BeNil(), "Fail to get Target pods")
			for _, podSpec := range target.Items {
				resourceVersionBefore, _ = strconv.Atoi(podSpec.ResourceVersion)
			}

			fmt.Println("Resource Version before chaos has been recorded")

			//Getting the ContainerIDs of target pod Containers and Sum of Container Restart Count
			containerCount := 0
			for _, podSpec := range target.Items {
				for i := 0; i < len(podSpec.Status.ContainerStatuses); i++ {
					containerIdBefore[containerCount] = (podSpec.Status.ContainerStatuses[i].ContainerID)
					containerDetailsBefore[podSpec.Status.ContainerStatuses[i].Name] = append(containerDetailsBefore[podSpec.Status.ContainerStatuses[i].Name], int(podSpec.Status.ContainerStatuses[i].RestartCount))
					containerCount++
				}
			}

			fmt.Println("ContainerIDs before chaos has been recorded")
			fmt.Println("Container Restart count before chaos has been recorded")

			//Getting the Container StartedAt value before Chaos
			for i, podSpec := range target.Items {
				startedAtBefore[i] = (podSpec.Status.ContainerStatuses[i].State.Running.StartedAt)
			}

			fmt.Println("Container StartedAt time before Chaos has been recorded")

			//Installing RBAC for the experiment
			//Fetching rbac file
			By("Fetching rbac file for the experiment")
			err = exec.Command("wget", "-O", "target-container-failure-sa.yaml", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/openebs/openebs-target-container-failure/rbac.yaml").Run()
			Expect(err).To(BeNil(), "failed to create rbac")
			if err != nil {
				fmt.Println(err)
			}

			rbacPath := "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/openebs/openebs-target-container-failure/rbac.yaml"
			installrbac, err := utils.InstallRbac(rbacPath, experimentName, client)
			Expect(installrbac).To(Equal(0), "Fail to create rbac file")
			Expect(err).To(BeNil(), "Fail to create RBAC")
			fmt.Println("Rbac has been created successfully !!!")

			//Creating Chaos-Experiment
			By("Creating Experiment")
			err = exec.Command("wget", "-O", "target-container-failure-exp.yaml", "https://hub.litmuschaos.io/api/chaos/master?file=charts/openebs/openebs-target-container-failure/experiment.yaml").Run()
			Expect(err).To(BeNil(), "fail get chaos experiment")
			err = exec.Command("sed", "-i", `s/litmuschaos\/ansible-runner:latest/`+chaosTypes.ExperimentRepoName+`\/`+chaosTypes.ExperimentImage+`:`+chaosTypes.ExperimentImageTag+`/g`, "target-container-failure-exp.yaml").Run()
			Expect(err).To(BeNil(), "fail to edit chaos experiment yaml")
			err = exec.Command("kubectl", "apply", "-f", "target-container-failure-exp.yaml", "-n", chaosTypes.ChaosNamespace).Run()
			Expect(err).To(BeNil(), "fail to create chaos experiment")

			fmt.Println("Chaos Experiment Created Successfully with image =", chaosTypes.ExperimentRepoName, "/", chaosTypes.ExperimentImage, ":", chaosTypes.ExperimentImageTag)

			//Installing chaos engine for the experiment
			//Fetching engine file
			By("Fetching engine file for the experiment")
			err = exec.Command("wget", "-O", "target-container-failure-ce.yaml", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/openebs/openebs-target-container-failure/engine.yaml").Run()
			Expect(err).To(BeNil(), "Fail to fetch engine file")
			//Modify chaos engine spec
			//Modify Namespace,Name,AppNs,AppLabel of the engine

			err = exec.Command("sed", "-i",
				`s/namespace: default/namespace: litmus/g;
			         s/name: target-chaos/name: engine3/g;
					 s/appns: 'default'/appns: 'litmus'/g;
					 s/jobCleanUpPolicy: 'delete'/jobCleanUpPolicy: 'retain'/g;					 					 
			         s/applabel: 'app=nginx'/applabel: 'name=percona'/g`,
				"target-container-failure-ce.yaml").Run()

			Expect(err).To(BeNil(), "Fail to change the fields of the engine")
			//Modify APP_PVC
			err = exec.Command("sed", "-i", `/name: APP_PVC/{n;s/.*/              value: "percona-vol1-claim"/}`, "target-container-failure-ce.yaml").Run()
			Expect(err).To(BeNil(), "Fail to Modify APP PVC name in engine spec")

			//Creating ChaosEngine
			By("Creating ChaosEngine")
			err = exec.Command("kubectl", "apply", "-f", "target-container-failure-ce.yaml", "-n", chaosTypes.ChaosNamespace).Run()
			Expect(err).To(BeNil(), "Fail to create chaos engine")
			if err != nil {
				fmt.Println(err)
			}

			fmt.Println("Chaosengine created successfully...")
			time.Sleep(2 * time.Second)

			//Fetching the runner pod and Checking if it get in Running state or not
			By("Wait for chaso-runner  to come in running sate")
			runner, err := client.CoreV1().Pods(chaosTypes.ChaosNamespace).Get(engineName+"-runner", metav1.GetOptions{})
			fmt.Printf("name : %v \n", runner.Name)
			//Running it for infinite time (say 3000 * 10)
			//The Gitlab job will quit if it takes more time than default time (10 min)
			for i := 0; i < 3000; i++ {
				if string(runner.Status.Phase) != "Running" {
					time.Sleep(1 * time.Second)
					runner, _ = client.CoreV1().Pods(chaosTypes.ChaosNamespace).Get(engineName+"-runner", metav1.GetOptions{})
					Expect(string(runner.Status.Phase)).NotTo(Or(Equal("Succeeded"), Equal("")))
					fmt.Printf("The Runner pod is in %v State\n", runner.Status.Phase)
				} else {
					break
				}
			}
			Expect(err).To(BeNil(), "Fail to get the runner pod")
			Expect(string(runner.Status.Phase)).To(Equal("Running"))

			//Waiting for experiment job to get completed
			//Also print the logs of the job
			By("Waiting for job completion")
			jobPodLogs, err := utils.JobLogs(experimentName, engineName, client)
			Expect(jobPodLogs).To(Equal(0), "Fail to print the logs of the experiment")
			Expect(err).To(BeNil(), "Fail to print the logs of the experiment")

			//Checking the chaosresult
			By("Checking the chaosresult")
			chaosResult, err := clientSet.ChaosResults(chaosTypes.ChaosNamespace).Get(engineName+"-"+experimentName, metav1.GetOptions{})
			fmt.Println("Chaos Result Verdict is: ", chaosResult.Status.ExperimentStatus.Verdict)
			Expect(err).To(BeNil(), "Fail to get chaosresult")
			Expect(string(chaosResult.Status.ExperimentStatus.Verdict)).To(Equal("Pass"), "Chaos Result Verdict is not Pass")
		})
	})

	//Matching the Resource Verison after Chaos
	Context("Check Resource Version of target container", func() {

		It("Should check for the change in Resource Version after Chaos", func() {

			podDetails := chaosTypes.PodDetails{}
			podDetails.PodNamespace = chaosTypes.TargetPodNs
			podDetails.PodLabel = chaosTypes.TargetPodLabels
			resourceVersion, err := utils.ComparePodResourceVersion(resourceVersionBefore, podDetails, client)
			Expect(resourceVersion).NotTo(Equal(0), "The Resource Version does not change")
			Expect(err).To(BeNil(), "Fail to get the pods")
			fmt.Println("The Resource Version changed !!!")

		})
	})

	//Matching the ContainerIDs after Chaos
	Context("Check ContainerIDs after chaos", func() {

		It("Should check for the change in ContainerIDs of target pod", func() {

			podDetails := chaosTypes.PodDetails{}
			podDetails.PodNamespace = chaosTypes.TargetPodNs
			podDetails.PodLabel = chaosTypes.TargetPodLabels
			containerID, err := utils.CompareContainerID(containerIdBefore, podDetails, client)
			Expect(containerID).NotTo(Equal(false), "The Container ID does not change")
			Expect(err).To(BeNil(), "Fail to get the pods")
			fmt.Println("Container ID Changed !!!")
		})
	})

	//Matching the Container Restart Count after Chaos
	Context("Check Container Restart Count", func() {

		It("Should check for the change in Container Restart Count after Chaos", func() {

			containerName := "cstor-istgt"
			podDetails := chaosTypes.PodDetails{}
			podDetails.PodNamespace = chaosTypes.TargetPodNs
			podDetails.PodLabel = chaosTypes.TargetPodLabels
			containerRestartCount, err := utils.CompareContainerRestartCount(containerDetailsBefore, containerName, podDetails, client)
			Expect(containerRestartCount).NotTo(Equal(true), "The restart count does not change")
			Expect(err).To(BeNil(), "Fail to get the pods")
			fmt.Println("The Restart count changed !!!")

		})
	})

	//Matching the Container StartedAt time after chaos
	Context("Check Container StartedAt time", func() {

		It("Should check for the change in Container Start time after Chaos", func() {

			podDetails := chaosTypes.PodDetails{}
			podDetails.PodNamespace = chaosTypes.TargetPodNs
			podDetails.PodLabel = chaosTypes.TargetPodLabels
			startedAt, err := utils.CompareStartedAt(startedAtBefore, podDetails, client)
			Expect(startedAt).NotTo(Equal(false), "The Container start time does not change")
			Expect(err).To(BeNil(), "Fail to get the pods")
			fmt.Println("Container startedAt time Changed !!!")

		})
	})
	// BDD for checking chaosengine Verdict
	Context("Check for chaos engine verdict", func() {

		It("Should check for the verdict of experiment", func() {

			By("Checking the Verdict of Chaos Experiment")
			time.Sleep(5 * time.Second)
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
