package delay

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

	//Getting the Application Status
	app, _ := client.AppsV1().Deployments("litmus").Get("percona", metav1.GetOptions{})
	count := 0
	for app.Status.UnavailableReplicas != 0 {
		if count < 50 {
			fmt.Printf("Percona is Creating, Currently Unavaliable Count is: %v \n", app.Status.UnavailableReplicas)
			app, _ = client.AppsV1().Deployments("litmus").Get("percona", metav1.GetOptions{})
			time.Sleep(10 * time.Second)
			count++
		} else {
			Fail("Application fails to get in ready state")
		}
	}

})

//BDD Tests to check openebs-target-pod-failure
var _ = Describe("BDD of openebs target pod failure experiment", func() {

	// BDD TEST CASE 1
	Context("Check for the openebs components", func() {

		It("Should check for creation of runner pod", func() {

			//Creating Chaos-Experiment
			By("Creating Experiment")
			err = exec.Command("kubectl", "apply", "-f", "https://hub.litmuschaos.io/api/chaos?file=charts/openebs/openebs-target-pod-failure/experiment.yaml", "-n", "litmus").Run()
			Expect(err).To(BeNil(), "fail to create chaos experiment")
			if err != nil {
				fmt.Println(err)
			}

			fmt.Println("Chaos Experiment Created Successfully")

			//Creating chaosEngine
			By("Creating ChaosEngine")
			chaosEngine := &v1alpha1.ChaosEngine{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "engine6",
					Namespace: "litmus",
				},
				Spec: v1alpha1.ChaosEngineSpec{
					AnnotationCheck:  "false",
					AuxiliaryAppInfo: "",
					Appinfo: v1alpha1.ApplicationParams{
						Appns:    "litmus",
						Applabel: "name=percona",
						AppKind:  "deployment",
					},
					ChaosServiceAccount: "litmus",
					Components: v1alpha1.ComponentParams{
						Runner: v1alpha1.RunnerInfo{
							Image: "litmuschaos/chaos-executor:ci",
							Type:  "go",
						},
					},
					Monitoring:       false,
					JobCleanUpPolicy: "retain",
					Experiments: []v1alpha1.ExperimentList{
						{
							Name: "openebs-target-pod-failure",
							Spec: v1alpha1.ExperimentAttributes{
								Components: v1alpha1.ExperimentComponents{
									ENV: []v1alpha1.ExperimentENV{
										{
											Name:  "TARGET_CONTAINER",
											Value: "cstor-istgt",
										},
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
			runner, err := client.CoreV1().Pods("litmus").Get("engine6-runner", metav1.GetOptions{})
			fmt.Printf("name : %v \n", runner.Name)
			for i := 0; i < 30; i++ {
				if string(runner.Status.Phase) != "Succeeded" {
					time.Sleep(10 * time.Second)
					runner, _ = client.CoreV1().Pods("litmus").Get("engine6-runner", metav1.GetOptions{})
					fmt.Printf("Currently Runner is in %v State, Please Wait ...\n", runner.Status.Phase)
				} else {
					break
				}
			}
			Expect(err).To(BeNil())
			Expect(string(runner.Status.Phase)).To(Or(Equal("Running"), Equal("Succeeded")))

			//Checking the chaosresult
			By("Checking the chaosresult")
			app, _ := clientSet.ChaosResults("litmus").Get("engine6-openebs-target-pod-failure", metav1.GetOptions{})
			Expect(string(app.Spec.ExperimentStatus.Verdict)).To(Equal("Pass"), "Verdict is not pass chaosresult")
		})
	})

})
