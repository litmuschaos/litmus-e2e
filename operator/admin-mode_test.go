package operator

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
	appv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	scheme "k8s.io/client-go/kubernetes/scheme"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	restclient "k8s.io/client-go/rest"
	"k8s.io/klog"
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
	//Prerequisite of the test
	chaosTypes.Config, err = utils.GetKubeConfig()
	if err != nil {
		Expect(err).To(BeNil(), "Failed to get kubeconfig client")
	}
	chaosTypes.Client, err = kubernetes.NewForConfig(chaosTypes.Config)
	if err != nil {
		Expect(err).To(BeNil(), "failed to get client")
	}
	chaosTypes.ClientSet, err = chaosClient.NewForConfig(chaosTypes.Config)
	if err != nil {
		Expect(err).To(BeNil(), "failed to get clientSet")
	}
	err = v1alpha1.AddToScheme(scheme.Scheme)
	if err != nil {
		fmt.Println(err)
	}

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

			adminapp := &appv1.Deployment{
				ObjectMeta: metav1.ObjectMeta{
					Name: "adminapp",
				},
				Spec: appv1.DeploymentSpec{
					Replicas: utils.Int32Ptr(1),
					Selector: &metav1.LabelSelector{
						MatchLabels: map[string]string{
							"run": "adminapp",
						},
					},
					Template: apiv1.PodTemplateSpec{
						ObjectMeta: metav1.ObjectMeta{
							Labels: map[string]string{
								"run": "adminapp",
							},
						},
						Spec: apiv1.PodSpec{
							Containers: []apiv1.Container{
								{
									Name:  "adminapp",
									Image: "nginx:1.12",
									Ports: []apiv1.ContainerPort{
										{
											Name:          "http",
											Protocol:      apiv1.ProtocolTCP,
											ContainerPort: 80,
										},
									},
								},
							},
						},
					},
				},
			}
			_, err := chaosTypes.Client.AppsV1().Deployments("default").Create(adminapp)
			if err != nil {
				klog.Infoln("adminapp deployment is not created and error is ", err)
				Fail("Fail to create adminapp deployment")
			}
			klog.Info("adminapp deployment is created")

			//Waiting for deployment to get ready
			err = utils.DeploymentRunningStatus("default", "adminapp")
			if err != nil {
				klog.Infof("Timeout, %v", err)
				os.Exit(1)
			}

			//Installing RBAC for experiment that is pod-delete
			rbacPath := "https://raw.githubusercontent.com/litmuschaos/pages/master/docs/litmus-admin-rbac.yaml"
			err = utils.DownloadFile("admin-rbac-sa.yaml", rbacPath)
			Expect(err).To(BeNil(), "Fail to fetch rbac file")
			//Modify chaos rbac spec
			err = utils.EditFile("admin-rbac-sa.yaml", "namespace: default", "namespace: litmus")
			Expect(err).To(BeNil(), "Failed to update namespace in rbac")
			err = exec.Command("kubectl", "apply", "-f", "admin-rbac-sa.yaml", "-n", "litmus").Run()
			Expect(err).To(BeNil(), "Fail to create RBAC")
			klog.Info("Rbac has been created successfully !!!")

			//Creating Chaos-Experiment for pod delete
			By("Creating Experiment for pod delete")
			err = utils.DownloadFile("admin-pod-delete.yaml", "https://hub.litmuschaos.io/api/chaos/master?file=charts/generic/pod-delete/experiment.yaml")
			Expect(err).To(BeNil(), "Fail to fetch experiment file")
			err = utils.EditFile("admin-pod-delete.yaml", "image: \"litmuschaos/ansible-runner:latest\"", "image: "+utils.GetEnv("EXPERIMENT_IMAGE", "litmuschaos/ansible-runner:latest"))
			Expect(err).To(BeNil(), "Failed to update the experiment image")
			err = utils.EditFile("admin-pod-delete.yaml", "name: pod-delete", "name: "+experimentName)
			Expect(err).To(BeNil(), "Failed to update the experiment name")
			err = exec.Command("kubectl", "apply", "-f", "admin-pod-delete.yaml", "-n", "litmus").Run()
			Expect(err).To(BeNil(), "Failed to create chaos experiment")
			klog.Info("Pod delete Chaos Experiment Created Successfully")

			//Installing chaos engine for the experiment
			//Fetching engine file
			By("Fetching engine file for pod delete experiment")
			err = utils.DownloadFile(experimentName+"-ce.yaml", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-delete/engine.yaml")
			Expect(err).To(BeNil(), "Fail to fetch engine file for pod delete")

			//Modify chaos engine spec
			//Modify Namespace,Name,AppNs,AppLabel of the engine
			err = utils.EditFile(experimentName+"-ce.yaml", "namespace: default", "namespace: litmus")
			Expect(err).To(BeNil(), "Failed to update namespace in engine")
			err = utils.EditFile(experimentName+"-ce.yaml", "name: nginx-chaos", "name: "+engineName)
			Expect(err).To(BeNil(), "Failed to update engine name in chaosengine file")
			err = utils.EditFile(experimentName+"-ce.yaml", "name: pod-delete", "name: "+experimentName)
			Expect(err).To(BeNil(), "Failed to update chaosexperiment name in chaosengine file")
			err = utils.EditFile(experimentName+"-ce.yaml", "chaosServiceAccount: pod-delete-sa", "chaosServiceAccount: litmus-admin")
			Expect(err).To(BeNil(), "Failed to update service account name in engine file")
			err = utils.EditFile(experimentName+"-ce.yaml", "annotationCheck: 'true'", "annotationCheck: 'false'")
			Expect(err).To(BeNil(), "Failed to update AnnotationCheck in engine")
			err = utils.EditFile(experimentName+"-ce.yaml", "jobCleanUpPolicy: 'delete'", "jobCleanUpPolicy: 'retain'")
			Expect(err).To(BeNil(), "Failed to update jobCleanUpPolicy in chaosengine file")
			err = utils.EditFile(experimentName+"-ce.yaml", "applabel: 'app=nginx'", "applabel: run=adminapp")
			Expect(err).To(BeNil(), "Failed to update application label in chaosengine file")

			//Creating ChaosEngine
			By("Creating ChaosEngine")
			err = exec.Command("kubectl", "apply", "-f", experimentName+"-ce.yaml", "-n", "litmus").Run()
			Expect(err).To(BeNil(), "Failed to create chaos engine")
			klog.Info("ChaosEngine for pod delete created successfully")
			time.Sleep(2 * time.Second)

			//Fetching the runner pod and Checking if it gets in Running state or not
			By("Wait for runner pod to come in running sate")
			runnerPodStatus, err := utils.RunnerPodStatus("litmus", engineName, chaosTypes.Client)
			Expect(runnerPodStatus).NotTo(Equal("1"), "Fail to get in running state")
			Expect(err).To(BeNil(), "Failed to get the runner pod")
			klog.Info("Runner pod for pod delete is in Running state")

			//Waiting for experiment job to get completed
			//Also Printing the logs of the experiment
			By("Waiting for job completion")
			jobPodLogs, err := utils.JobLogs(experimentName, "litmus", engineName, chaosTypes.Client)
			Expect(jobPodLogs).To(Equal(0), "Failed to print the logs of the experiment")
			Expect(err).To(BeNil(), "Failed to get the experiment job pod")

			//Checking the chaosresult
			By("Checking the chaosresult")
			chaosResult, err := chaosTypes.ClientSet.ChaosResults(utils.GetEnv("APP_NS", "litmus")).Get(engineName+"-"+"pod-delete", metav1.GetOptions{})
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
			err = utils.DownloadFile("admin-pod-delete-sa.yaml", "https://raw.githubusercontent.com/litmuschaos/pages/master/docs/litmus-admin-rbac.yaml")
			Expect(err).To(BeNil(), "Fail to fetch rbac file")
			//Modify chaos rbac spec
			err = utils.EditFile("admin-pod-delete-sa.yaml", "namespace: litmus", "namespace: test")
			Expect(err).To(BeNil(), "Failed to update namespace in rbac file")
			err = exec.Command("kubectl", "apply", "-f", "admin-pod-delete-sa.yaml").Run()
			Expect(err).To(BeNil(), "Fail to create RBAC")
			klog.Info("Rbac has been created successfully !!!")

			//Creating Chaos-Experiment for pod delete
			By("Creating Experiment for pod delete")
			err = utils.DownloadFile("admin-pod-delete.yaml", "https://hub.litmuschaos.io/api/chaos/master?file=charts/generic/pod-delete/experiment.yaml")
			Expect(err).To(BeNil(), "Fail to fetch chaos experiment file")
			err = utils.EditFile("admin-pod-delete.yaml", "name: pod-delete", "name: "+experimentName)
			Expect(err).To(BeNil(), "Failed to update the experiment image")
			err = utils.EditFile("admin-pod-delete.yaml", "image: \"litmuschaos/ansible-runner:latest\"", "image: "+utils.GetEnv("EXPERIMENT_IMAGE", "litmuschaos/ansible-runner:latest"))
			Expect(err).To(BeNil(), "Failed to update the experiment image")
			err = exec.Command("kubectl", "apply", "-f", "admin-pod-delete.yaml", "-n", "test").Run()
			Expect(err).To(BeNil(), "Fail to create chaos experiment")
			klog.Info("Chaos Experiment Created Successfully")

			//Installing chaos engine for the experiment
			//Fetching engine file
			By("Fetching engine file for pod delete experiment")
			err = utils.DownloadFile(experimentName+"-ce.yaml", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-delete/engine.yaml")
			Expect(err).To(BeNil(), "Fail to fetch engine file for pod delete")

			//Modify chaos engine spec
			err = utils.EditFile(experimentName+"-ce.yaml", "namespace: default", "namespace: test")
			Expect(err).To(BeNil(), "Failed to update namespace in engine")
			err = utils.EditFile(experimentName+"-ce.yaml", "name: nginx-chaos", "name: "+engineName)
			Expect(err).To(BeNil(), "Failed to update chaosengine name in chaosengine file")
			err = utils.EditFile(experimentName+"-ce.yaml", "chaosServiceAccount: pod-delete-sa", "chaosServiceAccount: litmus-admin")
			Expect(err).To(BeNil(), "Failed to update service account name in chaosengine file")
			err = utils.EditFile(experimentName+"-ce.yaml", "name: pod-delete", "name: "+experimentName)
			Expect(err).To(BeNil(), "Failed to update experiment name in chaosengine file")
			err = utils.EditFile(experimentName+"-ce.yaml", "annotationCheck: 'true'", "annotationCheck: 'false'")
			Expect(err).To(BeNil(), "Failed to update AnnotationCheck in engine")
			err = utils.EditFile(experimentName+"-ce.yaml", "jobCleanUpPolicy: 'delete'", "jobCleanUpPolicy: 'retain'")
			Expect(err).To(BeNil(), "Failed to update jobCleanUpPolicy in chaosengine")
			err = utils.EditFile(experimentName+"-ce.yaml", "applabel: 'app=nginx'", "applabel: run=adminapp")
			Expect(err).To(BeNil(), "Failed to update application label in engine")

			//Creating ChaosEngine
			By("Creating ChaosEngine")
			err = exec.Command("kubectl", "apply", "-f", experimentName+"-ce.yaml").Run()
			Expect(err).To(BeNil(), "Failed to create chaos engine")
			klog.Info("ChaosEngine for pod created successfully")
			time.Sleep(2 * time.Second)

			//Fetching the runner pod and Checking if it gets in Running state or not
			By("Wait for runner pod to come in running sate")
			runnerNamespace := "test"
			runnerPodStatus, err := utils.RunnerPodStatus(runnerNamespace, engineName, chaosTypes.Client)
			Expect(runnerPodStatus).NotTo(Equal("1"), "Failed to get the runner pod in running state")
			Expect(err).To(BeNil(), "Failed to get the runner pod")
			klog.Info("Runner pod for pod delete is in Running state")

			//Waiting for experiment job to get completed
			//Also Printing the logs of the experiment
			By("Waiting for job completion")
			jobNamespace := "test"
			jobPodLogs, err := utils.JobLogs(experimentName, jobNamespace, engineName, chaosTypes.Client)
			Expect(jobPodLogs).To(Equal(0), "Failed to print the logs of the experiment")
			Expect(err).To(BeNil(), "Failed to get the experiment job pod")

			//Checking the chaosresult
			By("Checking the chaosresult")
			chaosResult, err := chaosTypes.ClientSet.ChaosResults("test").Get(engineName+"-"+"pod-delete", metav1.GetOptions{})
			Expect(string(chaosResult.Status.ExperimentStatus.Verdict)).To(Equal("Pass"), "Verdict is not pass chaosresult")
			Expect(err).To(BeNil(), "Failed to get chaosresult")
		})
	})

})
