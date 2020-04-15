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
	kubeconfig      string
	config          *restclient.Config
	client          *kubernetes.Clientset
	clientSet       *chaosClient.LitmuschaosV1alpha1Client
	err             error
	podNameBefore   [3]string
	podIpBefore     [3]string
	startTimeBefore [3]*metav1.Time
	engineName      = "engine1"
	experimentName  = "openebs-pool-pod-failure"
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
			fmt.Printf("Percona is Getting Ready, Currently Unavaliable Count is: %v \n", app.Status.UnavailableReplicas)
			app, _ = client.AppsV1().Deployments(chaosTypes.ChaosNamespace).Get("percona", metav1.GetOptions{})
			time.Sleep(10 * time.Second)
			count++
		} else {
			Fail("Application fails to get in Ready state")
		}
	}

})

//BDD Tests for openebs pool pod failure
var _ = Describe("BDD test for openebs pool pod failure experiment", func() {

	// BDD TEST CASE 1
	resourceVersionSumBefore := 0
	Context("Check for the openebs components", func() {

		It("Should check for creation of runner pod", func() {

			//Getting the Sum of Resource Version, CSP pod name,PodIP, StartTime before Chaos
			csp, err := client.CoreV1().Pods(chaosTypes.CspPodNs).List(metav1.ListOptions{LabelSelector: chaosTypes.CspPodLabels})
			Expect(err).To(BeNil(), "fail to get csp pods")
			for i, podSpec := range csp.Items {
				rv, _ := strconv.Atoi(podSpec.ResourceVersion)
				podNameBefore[i] = podSpec.Name
				podIpBefore[i] = podSpec.Status.PodIP
				startTimeBefore[i] = podSpec.Status.StartTime
				resourceVersionSumBefore = resourceVersionSumBefore + rv
			}

			fmt.Println("Resource Version before chaos has been recorded")
			fmt.Println("CSP pod Name before chaos has been recorded")
			fmt.Println("PodIP of csp pod has been recorded")
			fmt.Println("StartTime of csp pod has been recorded")

			//Installing RBAC for the experiment
			//Fetching rbac file
			rbacPath := "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/openebs/openebs-pool-pod-failure/rbac.yaml"
			installrbac, err := utils.InstallRbac(rbacPath, experimentName, client)
			Expect(installrbac).To(Equal(0), "Fail to create rbac file")
			Expect(err).To(BeNil(), "Fail to create RBAC")
			fmt.Println("Rbac has been created successfully !!!")

			//Creating Chaos-Experiment
			By("Creating Experiment")
			Expect(err).To(BeNil(), "Fail to create chaos experiment")
			err = exec.Command("wget", "-O", "pool-pod-failure-exp.yaml", "https://hub.litmuschaos.io/api/chaos/master?file=charts/openebs/openebs-pool-pod-failure/experiment.yaml").Run()
			Expect(err).To(BeNil(), "fail get chaos experiment")
			err = exec.Command("sed", "-i", `s/litmuschaos\/ansible-runner:latest/`+chaosTypes.ExperimentRepoName+`\/`+chaosTypes.ExperimentImage+`:`+chaosTypes.ExperimentImageTag+`/g`, "pool-pod-failure-exp.yaml").Run()
			Expect(err).To(BeNil(), "fail to edit chaos experiment yaml")
			err = exec.Command("kubectl", "apply", "-f", "pool-pod-failure-exp.yaml", "-n", chaosTypes.ChaosNamespace).Run()
			Expect(err).To(BeNil(), "fail to create chaos experiment")

			fmt.Println("Chaos Experiment Created Successfully with image =", chaosTypes.ExperimentRepoName, "/", chaosTypes.ExperimentImage, ":", chaosTypes.ExperimentImageTag)

			//Installing chaos engine for the experiment
			//Fetching engine file
			By("Fetching engine file for the experiment")
			err = exec.Command("wget", "-O", "pool-pod-failure-ce.yaml", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/openebs/openebs-pool-pod-failure/engine.yaml").Run()
			Expect(err).To(BeNil(), "Fail to fetch engine file")
			//Modify chaos engine spec
			//Modify Namespace,Name,AppNs,AppLabel of the engine

			err = exec.Command("sed", "-i",
				`s/namespace: default/namespace: litmus/g;
			         s/name: pool-chaos/name: engine1/g;
					 s/appns: 'default'/appns: 'litmus'/g;
					 s/jobCleanUpPolicy: 'delete'/jobCleanUpPolicy: 'retain'/g;					 
			         s/applabel: 'app=nginx'/applabel: 'name=percona'/g`,
				"pool-pod-failure-ce.yaml").Run()
			Expect(err).To(BeNil(), "Fail to change the fields of the engine")

			//Modify APP_PVC
			err = exec.Command("sed", "-i", `/name: APP_PVC/{n;s/.*/              value: "percona-vol1-claim"/}`, "pool-pod-failure-ce.yaml").Run()
			Expect(err).To(BeNil(), "Fail to Modify APP PVC name in engine spec")

			//Creating ChaosEngine
			By("Creating ChaosEngine")
			err = exec.Command("kubectl", "apply", "-f", "pool-pod-failure-ce.yaml", "-n", chaosTypes.ChaosNamespace).Run()
			Expect(err).To(BeNil(), "Fail to create chaosEngine")
			if err != nil {
				fmt.Println(err)
			}

			fmt.Println("Chaosengine created successfully...")
			time.Sleep(2 * time.Second)

			//Fetching the runner pod and Checking if it get in Running state or not
			By("Wait for chaso-runner  to come in running sate")
			runner, err := client.CoreV1().Pods(chaosTypes.ChaosNamespace).Get(engineName+"-runner", metav1.GetOptions{})
			fmt.Printf("name : %v \n", runner.Name)
			//Running it for infinite time (say 3000)
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
			Expect(jobPodLogs).To(Equal(0), "Fail to wait for job completion")
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
	Context("Check Resource Version of pool container", func() {

		It("Should check for the change in Resource Version after Chaos", func() {

			podDetails := chaosTypes.PodDetails{}
			podDetails.PodNamespace = chaosTypes.CspPodNs
			podDetails.PodLabel = chaosTypes.CspPodLabels
			resourceVersion, err := utils.CompareDeploymentResourceVersion(resourceVersionSumBefore, podDetails, client)
			Expect(resourceVersion).NotTo(Equal(0), "The Resource Version does not change")
			Expect(err).To(BeNil(), "Fail to get the pods")
			fmt.Println("Resource Version changed !!!")

		})
	})

	//Matching the Pool Pod Name
	Context("Check pool pod Name", func() {

		It("Should check for the change in name of pool pod after Chaos", func() {

			podDetails := chaosTypes.PodDetails{}
			podDetails.PodNamespace = chaosTypes.CspPodNs
			podDetails.PodLabel = chaosTypes.CspPodLabels
			podName, err := utils.ComparePodName(podNameBefore, podDetails, client)
			Expect(podName).NotTo(Equal(false), "The Pool pod name does not change")
			Expect(err).To(BeNil(), "Fail to get the pods")
			fmt.Println("Pool pod name Changed !!!")

		})
	})

	//Matching pod PodIP
	Context("Check pod PodIP", func() {

		It("Should check for the change in pod PodIP after Chaos", func() {

			podDetails := chaosTypes.PodDetails{}
			podDetails.PodNamespace = chaosTypes.CspPodNs
			podDetails.PodLabel = chaosTypes.CspPodLabels
			podIp, err := utils.ComparePodIP(podIpBefore, podDetails, client)
			Expect(podIp).NotTo(Equal(false), "The PodIP does not change")
			Expect(err).To(BeNil(), "Fail to get the pods")
			fmt.Println("Pod PodIP Changed !!!")

		})
	})

	//Matching pod StartTime
	Context("Check pod StartTime", func() {

		It("Should check for the change in pod StartTime after Chaos", func() {

			podDetails := chaosTypes.PodDetails{}
			podDetails.PodNamespace = chaosTypes.CspPodNs
			podDetails.PodLabel = chaosTypes.CspPodLabels
			startTime, err := utils.ComparePodStartTime(startTimeBefore, podDetails, client)
			Expect(startTime).NotTo(Equal(false), "Pod start time does not change")
			Expect(err).To(BeNil(), "Fail to get the pods")
			fmt.Println("Pod start time Changed !!!")

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
