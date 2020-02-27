package tests

import (
	"fmt"
	"os"
	"os/exec"
	"strconv"
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
	kubeconfig        string
	config            *restclient.Config
	client            *kubernetes.Clientset
	clientSet         *chaosClient.LitmuschaosV1alpha1Client
	err               error
	containerIdBefore [9]string
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
	app, _ := client.AppsV1().Deployments("litmus").Get("percona", metav1.GetOptions{})
	count := 0
	for app.Status.UnavailableReplicas != 0 {
		if count < 50 {
			fmt.Printf("Percona Application is Creating, Currently Unavaliable Count is: %v \n", app.Status.UnavailableReplicas)
			app, _ = client.AppsV1().Deployments("litmus").Get("percona", metav1.GetOptions{})
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
	restartCountSumBefore := 0
	cspPodLabels := "app=cstor-pool"
	cspPodNs := "openebs"
	Context("Check for the components of openebs", func() {

		It("Should check for creation of runner pod", func() {

			//Getting the Sum of Resource Version before Chaos
			csp, err := client.CoreV1().Pods(cspPodNs).List(metav1.ListOptions{LabelSelector: cspPodLabels})
			Expect(err).To(BeNil(), "fail to get csp pods")
			for _, podSpec := range csp.Items {
				rv, _ := strconv.Atoi(podSpec.ResourceVersion)
				resourceVersionSumBefore = resourceVersionSumBefore + rv
			}

			fmt.Printf("Resource Version before chaos has been recorded\n")

			//Getting the ContainerIDs of CSP pod Containers and Sum of Container Restart Count
			containerCount := 0
			for _, podSpec := range csp.Items {
				for i := 0; i < len(podSpec.Status.ContainerStatuses); i++ {
					containerIdBefore[containerCount] = (podSpec.Status.ContainerStatuses[i].ContainerID)
					restartCountSumBefore = restartCountSumBefore + int(podSpec.Status.ContainerStatuses[i].RestartCount)
					containerCount++
				}
			}

			fmt.Printf("ContainerIDs before chaos has been recorded\n")
			fmt.Printf("Container Restart count before chaos has been recorded\n")

			//Fetching rbac file
			By("Fetching rbac file for the experiment")
			err = exec.Command("wget", "-O", "pool-container-failure-sa.yaml", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/openebs/openebs-pool-container-failure/rbac.yaml").Run()
			Expect(err).To(BeNil(), "failed to create rbac")
			if err != nil {
				fmt.Println(err)
			}

			//Modify Namespace field of the rbac
			By("Modify Namespace field of the rbac")
			err = exec.Command("sed", "-i", `s/namespace: default/namespace: litmus/g`, "pool-container-failure-sa.yaml").Run()
			Expect(err).To(BeNil(), "failed to create rbac")
			if err != nil {
				fmt.Println(err)
			}

			//Creating rbac for the experiment
			By("Creating rbac for the experiment")
			err = exec.Command("kubectl", "apply", "-f", "pool-container-failure-sa.yaml").Run()
			Expect(err).To(BeNil(), "fail to create chaos experiment")
			if err != nil {
				fmt.Println(err)
			}

			//Creating Chaos-Experiment
			By("Creating Experiment")
			err = exec.Command("wget", "-O", "pool-container-failure-ce.yaml", "https://hub.litmuschaos.io/api/chaos?file=charts/openebs/openebs-pool-container-failure/experiment.yaml").Run()
			Expect(err).To(BeNil(), "fail get chaos experiment")
			err = exec.Command("sed", "-i", `s/ansible-runner:latest/ansible-runner:ci/g`, "pool-container-failure-ce.yaml").Run()
			Expect(err).To(BeNil(), "fail to edit chaos experiment yaml")
			err = exec.Command("kubectl", "apply", "-f", "pool-container-failure-ce.yaml", "-n", "litmus").Run()
			Expect(err).To(BeNil(), "fail to create chaos experiment")

			fmt.Println("Chaos Experiment Created Successfully")

			//Creating chaosEngine
			By("Creating ChaosEngine")
			chaosEngine := &v1alpha1.ChaosEngine{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "engine",
					Namespace: "litmus",
				},
				Spec: v1alpha1.ChaosEngineSpec{
					AnnotationCheck:  "false",
					EngineState:      "active",
					AuxiliaryAppInfo: "",
					Appinfo: v1alpha1.ApplicationParams{
						Appns:    "litmus",
						Applabel: "name=percona",
						AppKind:  "deployment",
					},
					ChaosServiceAccount: "pool-container-failure-sa",
					Components: v1alpha1.ComponentParams{
						Runner: v1alpha1.RunnerInfo{
							Image: "litmuschaos/chaos-runner:ci",
							Type:  "go",
						},
					},
					Monitoring:       false,
					JobCleanUpPolicy: "delete",
					Experiments: []v1alpha1.ExperimentList{
						{
							Name: "openebs-pool-container-failure",
							Spec: v1alpha1.ExperimentAttributes{
								Components: v1alpha1.ExperimentComponents{
									ENV: []v1alpha1.ExperimentENV{
										{
											Name:  "APP_PVC",
											Value: "percona-vol1-claim",
										},
									},
								},
							},
						},
					},
				},
			}

			_, err = clientSet.ChaosEngines("litmus").Create(chaosEngine)
			if err != nil {
				fmt.Println(err)
			}
			time.Sleep(5 * time.Second)

			fmt.Println("Chaosengine created successfully...")

			//Fetching engine-nginx-runner pod
			runner, err := client.CoreV1().Pods("litmus").Get("engine-runner", metav1.GetOptions{})
			fmt.Printf("name : %v \n", runner.Name)
			for i := 0; i < 30; i++ {
				if string(runner.Status.Phase) != "Succeeded" {
					time.Sleep(10 * time.Second)
					runner, _ = client.CoreV1().Pods("litmus").Get("engine-runner", metav1.GetOptions{})
					fmt.Printf("Currently the Runner pod is in %v State, Please Wait ...\n", runner.Status.Phase)
				} else {
					break
				}
			}
			Expect(err).To(BeNil())
			Expect(string(runner.Status.Phase)).To(Or(Equal("Running"), Equal("Succeeded")))

			//Checking the chaosresult
			By("Checking the chaosresult")
			app, _ := clientSet.ChaosResults("litmus").Get("engine-openebs-pool-container-failure", metav1.GetOptions{})
			Expect(string(app.Spec.ExperimentStatus.Verdict)).To(Equal("Pass"), "Verdict is not pass chaosresult")
		})
	})

	//Matching the Resource Verison after Chaos
	Context("Check Resource Version of pool container", func() {

		It("Should check for the change in Resource Version after Chaos", func() {
			resourceVersionSumAfter := 0
			csp_rv, err := client.CoreV1().Pods(cspPodNs).List(metav1.ListOptions{LabelSelector: cspPodLabels})
			Expect(err).To(BeNil(), "fail to get the csp pods")
			for _, podSpec := range csp_rv.Items {
				rv, _ := strconv.Atoi(podSpec.ResourceVersion)
				resourceVersionSumAfter = resourceVersionSumAfter + rv
			}

			Expect(resourceVersionSumBefore-resourceVersionSumAfter).NotTo(Equal(0), "The Resource Version does not change")
			fmt.Printf("The Resource Version changes\n")

		})
	})

	//Matching the ContainerIDs after Chaos
	Context("Check ContainerIDs after chaos", func() {

		It("Should check for the change in ContainerIDs of csp pod", func() {
			var containerIdAfter [9]string
			containerCount := 0
			containerIDChanged := false
			csp, err := client.CoreV1().Pods(cspPodNs).List(metav1.ListOptions{LabelSelector: cspPodLabels})
			Expect(err).To(BeNil(), "fail to get the csp pods")
			for _, podSpec := range csp.Items {
				for i := 0; i < len(podSpec.Status.ContainerStatuses); i++ {
					containerIdAfter[containerCount] = (podSpec.Status.ContainerStatuses[i].ContainerID)
					containerCount++
				}
			}
			for i := range containerIdBefore {
				if containerIdBefore[i] != containerIdAfter[i] {
					containerIDChanged = true
					break
				}
			}

			Expect(containerIDChanged).NotTo(Equal(false), "The Container ID does not change")
			fmt.Printf("Container ID Changes!!!\n")
		})
	})

	//Matching the Container Restart Count after Chaos
	Context("Check Container Restart Count", func() {

		It("Should check for the change in Container Restart Count after Chaos", func() {
			restartCountSumAfter := 0
			csp_rc, err := client.CoreV1().Pods(cspPodNs).List(metav1.ListOptions{LabelSelector: cspPodLabels})
			Expect(err).To(BeNil(), "fail to get the csp pods")
			for _, podSpec := range csp_rc.Items {
				for i := 0; i < len(podSpec.Status.ContainerStatuses); i++ {
					restartCountSumAfter = restartCountSumAfter + int(podSpec.Status.ContainerStatuses[i].RestartCount)
				}
			}

			Expect(restartCountSumBefore-restartCountSumAfter).NotTo(Equal(0), "The restart count does not change")
			fmt.Printf("The Restart count changes")

		})
	})

})
