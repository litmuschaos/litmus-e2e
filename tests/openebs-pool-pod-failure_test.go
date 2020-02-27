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
	kubeconfig      string
	config          *restclient.Config
	client          *kubernetes.Clientset
	clientSet       *chaosClient.LitmuschaosV1alpha1Client
	err             error
	podNameBefore   [3]string
	podIpBefore     [3]string
	hostIpBefore    [3]string
	startTimeBefore [3]*metav1.Time
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
			fmt.Printf("Percona is Getting Ready, Currently Unavaliable Count is: %v \n", app.Status.UnavailableReplicas)
			app, _ = client.AppsV1().Deployments("litmus").Get("percona", metav1.GetOptions{})
			time.Sleep(10 * time.Second)
			count++
		} else {
			Fail("Application fails to get in Ready state")
		}
	}

})

//BDD Tests for openebs pool pod failure
var _ = Describe("BDD of openebs pool pod failure experiment", func() {

	// BDD TEST CASE 1
	resourceVersionSumBefore := 0
	cspPodLabels := "app=cstor-pool"
	cspPodNs := "openebs"
	Context("Check for the openebs components", func() {

		It("Should check for creation of runner pod", func() {
      
			//Fetching rbac file
			By("Fetching rbac file for the experiment")
			err = exec.Command("wget", "-O", "pool-pod-failure-sa.yaml", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/openebs/openebs-pool-pod-failure/rbac.yaml").Run()
			Expect(err).To(BeNil(), "failed to create rbac")
			if err != nil {
				fmt.Println(err)
			}

			//Modify Namespace field of the rbac
			By("Modify Namespace field of the rbac")
			err = exec.Command("sed", "-i", `s/namespace: default/namespace: litmus/g`, "pool-pod-failure-sa.yaml").Run()
			Expect(err).To(BeNil(), "failed to create rbac")
			if err != nil {
				fmt.Println(err)
			}

			//Creating rbac file for the experiment
			By("Creating rbac file for the experiment")
			err = exec.Command("kubectl", "apply", "-f", "pool-pod-failure-sa.yaml").Run()
			Expect(err).To(BeNil(), "fail to create chaos experiment")
			if err != nil {
				fmt.Println(err)
			}

			//Creating Chaos-Experiment
			By("Creating Experiment")
			err = exec.Command("kubectl", "apply", "-f", "https://hub.litmuschaos.io/api/chaos?file=charts/openebs/openebs-pool-pod-failure/experiment.yaml", "-n", "litmus").Run()
			Expect(err).To(BeNil(), "fail to create chaos experiment")
			if err != nil {
				fmt.Println(err)
			}

			fmt.Println("Chaos Experiment Created Successfully")

			//Creating chaosEngine
			By("Creating ChaosEngine")
			chaosEngine := &v1alpha1.ChaosEngine{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "engine1",
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
					ChaosServiceAccount: "pool-pod-failure-sa",
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
							Name: "openebs-pool-pod-failure",
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
			runner, err := client.CoreV1().Pods("litmus").Get("engine1-runner", metav1.GetOptions{})
			fmt.Printf("name : %v \n", runner.Name)
			for i := 0; i < 50; i++ {
				if string(runner.Status.Phase) != "Succeeded" {
					time.Sleep(20 * time.Second)
					runner, _ = client.CoreV1().Pods("litmus").Get("engine1-runner", metav1.GetOptions{})
					fmt.Printf("Currently, the Runner pod is in %v State, Please Wait ...\n", runner.Status.Phase)
				} else {
					break
				}
			}
			Expect(err).To(BeNil())
			Expect(string(runner.Status.Phase)).To(Or(Equal("Running"), Equal("Succeeded")))

			//Checking the chaosresult
			By("Checking the chaosresult")
			app, _ := clientSet.ChaosResults("litmus").Get("engine1-openebs-pool-pod-failure", metav1.GetOptions{})
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

			Expect(resourceVersionSumAfter-resourceVersionSumBefore).NotTo(Equal(0), "The Resource Version does not change")
			fmt.Printf("The Resource Version changes\n")

		})
	})

	//Matching the Pool Pod Name
	Context("Check csp pod Name", func() {

		It("Should check for the change in name of csp pod after Chaos", func() {

			var podNameAfter [3]string
			podNameChanged := false
			csp_name, err := client.CoreV1().Pods(cspPodNs).List(metav1.ListOptions{LabelSelector: cspPodLabels})
			Expect(err).To(BeNil(), "fail to get the csp pods")
			for i, podSpec := range csp_name.Items {
				podNameAfter[i] = podSpec.Name
			}

			for i := range podNameAfter {
				if podNameAfter[i] != podNameBefore[i] {
					podNameChanged = true
					break
				}
			}

			Expect(podNameChanged).NotTo(Equal(false), "The csp pod name does not change")
			fmt.Printf("CSP pod name Changes!!!\n")

		})
	})

	//Matching csp pod PodIP
	Context("Check csp pod PodIP", func() {

		It("Should check for the change in csp pod PodIP after Chaos", func() {

			var podIpAfter [3]string
			podIpChanged := false
			csp_podip, err := client.CoreV1().Pods(cspPodNs).List(metav1.ListOptions{LabelSelector: cspPodLabels})
			Expect(err).To(BeNil(), "fail to get the csp pods")
			for i, podSpec := range csp_podip.Items {
				podIpAfter[i] = podSpec.Status.PodIP
			}

			for i := range podIpAfter {
				if podIpBefore[i] != podIpAfter[i] {
					podIpChanged = true
					break
				}
			}

			Expect(podIpChanged).NotTo(Equal(false), "The csp pod PodIP does not change")
			fmt.Printf("CSP pod PodIP Changes!!!\n")

		})
	})

	//Matching csp pod HostIP
	Context("Check csp pod HostIP", func() {

		It("Should check for the change in csp pod HostIP after Chaos", func() {

			var hostIpAfter [3]string
			hostIpChanged := false
			csp_hostip, err := client.CoreV1().Pods(cspPodNs).List(metav1.ListOptions{LabelSelector: cspPodLabels})
			Expect(err).To(BeNil(), "fail to get the csp pods")
			for i, podSpec := range csp_hostip.Items {
				hostIpAfter[i] = podSpec.Status.HostIP
			}

			for i := range hostIpAfter {
				if hostIpBefore[i] != hostIpAfter[i] {
					hostIpChanged = true
					break
				}
			}

			Expect(hostIpChanged).NotTo(Equal(false), "The csp pod HostIP does not change")
			fmt.Printf("CSP pod HostIP Changes!!!\n")

		})
	})
	//Matching csp pod StartTime
	Context("Check csp pod StartTime", func() {

		It("Should check for the change in csp pod StartTime after Chaos", func() {

			var startTimeAfter [3]*metav1.Time
			startTimeChanged := false
			csp_starttime, err := client.CoreV1().Pods(cspPodNs).List(metav1.ListOptions{LabelSelector: cspPodLabels})
			Expect(err).To(BeNil(), "fail to get the csp pods")
			for i, podSpec := range csp_starttime.Items {
				startTimeAfter[i] = podSpec.Status.StartTime
			}

			for i := range startTimeAfter {
				if startTimeBefore[i] != startTimeAfter[i] {
					startTimeChanged = true
					break
				}
			}

			Expect(startTimeChanged).NotTo(Equal(false), "The csp pod StartTime does not change")
			fmt.Printf("CSP pod StartTime Changes!!!\n")

		})
	})
})
