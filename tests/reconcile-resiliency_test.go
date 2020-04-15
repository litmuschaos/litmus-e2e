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
	kubeconfig      string
	config          *restclient.Config
	client          *kubernetes.Clientset
	clientSet       *chaosClient.LitmuschaosV1alpha1Client
	err             error
	experimentName1 = "pod-delete"
	experimentName2 = "container-kill"
	engineName      = "testengine"
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
	Expect(err).To(BeNil(), "Fail to get operator")
	count := 0
	for operator.Status.UnavailableReplicas != 0 {
		if count < 50 {
			fmt.Printf("Unavaliable Count: %v \n", operator.Status.UnavailableReplicas)
			operator, err = client.AppsV1().Deployments(chaosTypes.ChaosNamespace).Get("litmus", metav1.GetOptions{})
			Expect(err).To(BeNil(), "Fail to get operator")
			time.Sleep(5 * time.Second)
			count++
		} else {
			Fail("Operator is not in Ready state Time Out")
		}
	}
	fmt.Println("Chaos Operator is up and Running")
})

//BDD Tests for operator reconcile resiliency
//Checking for the creation of runner pod for application in same namespace
var _ = Describe("BDD of operator reconcile resiliency check", func() {

	// BDD TEST CASE 1
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

			//Creating first application for pod-delete in default namespace
			By("Creating first deployment for pod-delete chaos")
			err = exec.Command("kubectl", "run", "testapp1", "--image=nginx").Run()
			Expect(err).To(BeNil(), "Failed to create testapp1 deployment")
			fmt.Println("Test Application testapp1 is created")

			//Creating Second application for container-kill in test-1 namespace
			By("Creating second deployment for container-kill chaos")
			err = exec.Command("kubectl", "run", "testapp2", "--image=nginx", "-n", chaosTypes.ChaosNamespace).Run()
			Expect(err).To(BeNil(), "Failed to create testapp2 deployment")
			fmt.Println("Test Application testapp2 is created")

			//Installing RBAC for first experiment that is pod-delete
			rbacPath := "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-delete/rbac.yaml"
			rbacNamespace := "default"
			installrbac, err := utils.InstallRbac(rbacPath, rbacNamespace, experimentName1, client)
			Expect(installrbac).To(Equal(0), "Fail to create rbac file")
			Expect(err).To(BeNil(), "Fail to create RBAC")
			fmt.Println("Rbac for pod-delete has been created successfully !!!")

			//Installing RBAC for second experiment that is container-kill
			rbacPath = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/container-kill/rbac.yaml"
			rbacNamespace = chaosTypes.ChaosNamespace
			installrbac, err = utils.InstallRbac(rbacPath, rbacNamespace, experimentName2, client)
			Expect(installrbac).To(Equal(0), "Fail to create rbac file")
			Expect(err).To(BeNil(), "Fail to create RBAC")
			fmt.Println("Rbac for container kill has been created successfully !!!")

			//Creating Chaos-Experiment for pod delete
			By("Creating Experiment for pod delete")
			err = exec.Command("wget", "-O", "pod-delete.yaml", "https://hub.litmuschaos.io/api/chaos/master?file=charts/generic/pod-delete/experiment.yaml").Run()
			Expect(err).To(BeNil(), "fail get chaos experiment")
			err = exec.Command("sed", "-i", `s/litmuschaos\/ansible-runner:latest/`+chaosTypes.ExperimentRepoName+`\/`+chaosTypes.ExperimentImage+`:`+chaosTypes.ExperimentImageTag+`/g`, "pod-delete.yaml").Run()
			Expect(err).To(BeNil(), "fail to edit chaos experiment yaml")
			err = exec.Command("kubectl", "apply", "-f", "pod-delete.yaml").Run()
			Expect(err).To(BeNil(), "fail to create chaos experiment")
			fmt.Println("Pod delete Chaos Experiment Created Successfully")

			//Creating Chaos-Experiment for container kill
			By("Creating Experiment for container kill")
			err = exec.Command("wget", "-O", "container-kill.yaml", "https://hub.litmuschaos.io/api/chaos/master?file=charts/generic/container-kill/experiment.yaml").Run()
			Expect(err).To(BeNil(), "fail get chaos experiment")
			err = exec.Command("sed", "-i",
				`s/litmuschaos\/ansible-runner:latest/`+chaosTypes.ExperimentRepoName+`\/`+chaosTypes.ExperimentImage+`:`+chaosTypes.ExperimentImageTag+`/g;
			     s/name: container-kill/name: container-kill-test/g`,
				"container-kill.yaml").Run()
			Expect(err).To(BeNil(), "fail to edit chaos experiment yaml")
			err = exec.Command("kubectl", "apply", "-f", "container-kill.yaml", "-n", chaosTypes.ChaosNamespace).Run()
			Expect(err).To(BeNil(), "fail to create chaos experiment")
			fmt.Println("Container kill Chaos Experiment Created Successfully")

			//Installing chaos engine for pod-delete experiment
			//Fetching engine file
			By("Fetching engine file for pod delete experiment")
			err = exec.Command("wget", "-O", experimentName1+"-ce.yaml", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-delete/engine.yaml").Run()
			Expect(err).To(BeNil(), "Fail to fetch engine file for pod delete")
			//Modify chaos engine spec
			//Modify Namespace,Name,AppNs,AppLabel of the engine

			err = exec.Command("sed", "-i",
				`s/name: nginx-chaos/name: `+engineName+`/g;
					 s/jobCleanUpPolicy: 'delete'/jobCleanUpPolicy: 'retain'/g;
					 s/annotationCheck: 'true'/annotationCheck: 'false'/g;
			         s/applabel: 'app=nginx'/applabel: 'run=testapp1'/g`,
				experimentName1+"-ce.yaml").Run()
			//Modify FORCE
			err = exec.Command("sed", "-i", `/name: FORCE/{n;s/.*/              value: ""/}`, experimentName1+"-ce.yaml").Run()
			Expect(err).To(BeNil(), "Fail to Modify FORCE field of chaos engine")

			//Creating ChaosEngine
			By("Creating ChaosEngine")
			err = exec.Command("kubectl", "apply", "-f", experimentName1+"-ce.yaml").Run()
			Expect(err).To(BeNil(), "Fail to create chaos engine")
			fmt.Println("ChaosEngine for pod delete created successfully...")
			time.Sleep(2 * time.Second)

			//Fetching the runner pod and Checking if it gets in Running state or not
			By("Wait for runner pod to come in running sate")
			runnerNamespace1 := "default"
			runnerPodStatus1, err := utils.RunnerPodStatus(runnerNamespace1, engineName, client)
			Expect(runnerPodStatus1).NotTo(Equal("1"), "Failed to get in running state")
			Expect(err).To(BeNil(), "Fail to get the runner pod")
			fmt.Println("Runner pod for pod delete is in Running state")

			//Installing chaos engine for container kill experiment
			//Fetching engine file
			By("Fetching engine file for container kill")
			err = exec.Command("wget", "-O", experimentName2+"-ce.yaml", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/container-kill/engine.yaml").Run()
			Expect(err).To(BeNil(), "Fail to fetch engine file for container kill")
			//Modify chaos engine spec
			//Modify Namespace,Name,AppNs,AppLabel of the engine

			err = exec.Command("sed", "-i",
				`s/name: nginx-chaos/name: `+engineName+`/g;
					 s/jobCleanUpPolicy: 'delete'/jobCleanUpPolicy: 'retain'/g;
					 s/annotationCheck: 'true'/annotationCheck: 'false'/g;
					 s/name: container-kill/name: container-kill-test/g;
					 s/namespace: default/namespace: `+chaosTypes.ChaosNamespace+`/g;
					 s/applabel: 'app=nginx'/applabel: 'run=testapp2'/g`,
				experimentName2+"-ce.yaml").Run()

			//Creating ChaosEngine
			By("Creating ChaosEngine")
			err = exec.Command("kubectl", "apply", "-f", experimentName2+"-ce.yaml").Run()
			Expect(err).To(BeNil(), "Fail to create chaos engine")
			fmt.Println("ChaosEngine for container kill created successfully...")
			time.Sleep(2 * time.Second)

			//Fetching the runner pod and Checking if it gets in Running state or not
			By("Wait for runner pod to come in running sate")
			runnerNamespace2 := chaosTypes.ChaosNamespace
			runnerPodStatus2, err := utils.RunnerPodStatus(runnerNamespace2, engineName, client)
			Expect(runnerPodStatus2).NotTo(Equal("1"), "Failed to get in running state")
			Expect(err).To(BeNil(), "Fail to get the runner pod")
			fmt.Println("Runner pod for container kill is in Running state")

			//Visualising the components at default namespace
			By("Getting the components in default namespace")
			out1, err1 := exec.Command("kubectl", "get", "pods").Output()
			if err != nil {
				log.Fatal(err1)
			}
			fmt.Printf("The output is: %s\n", out1)

			//Visualising the components at chaosNamespace namespace
			By("Getting the components in chaosNamespace namespace")
			out2, err2 := exec.Command("kubectl", "get", "pods", "-n", chaosTypes.ChaosNamespace).Output()
			if err != nil {
				log.Fatal(err2)
			}
			fmt.Printf("The output is: %s\n", out2)
		})
	})
})
