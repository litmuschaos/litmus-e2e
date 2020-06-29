package operator

import (
	"fmt"
	"log"
	"os/exec"
	"testing"
	"time"

	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	chaosClient "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus-e2e/pkg/utils"
	chaosTypes "github.com/litmuschaos/litmus-e2e/types"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"k8s.io/client-go/kubernetes"
	scheme "k8s.io/client-go/kubernetes/scheme"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	"k8s.io/klog"
)

func TestReconcileResiliency(t *testing.T) {

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
		klog.Info(err)
	}

})

//BDD Tests for operator reconcile resiliency
//Checking for the creation of runner pod for application in same namespace
var _ = Describe("BDD of operator reconcile resiliency check", func() {

	// BDD TEST CASE 1
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

			var err error
			var experimentName1 = "pod-delete"
			var experimentName2 = "container-kill"
			var engineName = "testengine"
			//Creating first application for pod-delete in default namespace
			By("Creating first deployment for pod-delete chaos")
			err = exec.Command("kubectl", "run", "testapp1", "--image=nginx").Run()
			Expect(err).To(BeNil(), "Failed to create testapp1 deployment")
			klog.Info("Test Application testapp1 is created")

			//Creating Second application for container-kill in test-1 namespace
			By("Creating second deployment for container-kill chaos")
			err = exec.Command("kubectl", "run", "testapp2", "--image=nginx", "-n", chaosTypes.ChaosNamespace).Run()
			Expect(err).To(BeNil(), "Failed to create testapp2 deployment")
			klog.Info("Test Application testapp2 is created")

			//Installing RBAC for first experiment that is pod-delete
			rbacPath := "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-delete/rbac.yaml"
			rbacNamespace := "default"
			installrbac, err := utils.InstallRbac(rbacPath, rbacNamespace, experimentName1, chaosTypes.Client)
			Expect(installrbac).To(Equal(0), "Fail to create rbac file")
			Expect(err).To(BeNil(), "Fail to create RBAC")
			klog.Info("Rbac for pod-delete has been created successfully !!!")

			//Installing RBAC for second experiment that is container-kill
			rbacPath = "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/container-kill/rbac.yaml"
			rbacNamespace = chaosTypes.ChaosNamespace
			installrbac, err = utils.InstallRbac(rbacPath, rbacNamespace, experimentName2, chaosTypes.Client)
			Expect(installrbac).To(Equal(0), "Fail to create rbac file")
			Expect(err).To(BeNil(), "Fail to create RBAC")
			klog.Info("Rbac for container kill has been created successfully !!!")

			//Creating Chaos-Experiment for pod delete
			By("Creating Experiment for pod delete")
			err = utils.DownloadFile("pod-delete.yaml", "https://hub.litmuschaos.io/api/chaos/master?file=charts/generic/pod-delete/experiment.yaml")
			Expect(err).To(BeNil(), "Fail to fetch experiment file")
			err = utils.EditFile("pod-delete.yaml", "image: \"litmuschaos/ansible-runner:latest\"", "image: "+utils.GetEnv("EXPERIMENT_IMAGE", "litmuschaos/ansible-runner:latest"))
			Expect(err).To(BeNil(), "Failed to update the experiment image")
			err = exec.Command("kubectl", "apply", "-f", "pod-delete.yaml", "-n", "litmus").Run()
			Expect(err).To(BeNil(), "Failed to create chaos experiment")
			klog.Info("Pod delete Chaos Experiment Created Successfully")

			//Creating Chaos-Experiment for container kill
			By("Creating Experiment for container kill")
			err = utils.DownloadFile("container-kill.yaml", "https://hub.litmuschaos.io/api/chaos/master?file=charts/generic/container-kill/experiment.yaml")
			Expect(err).To(BeNil(), "Fail to fetch experiment file")
			err = utils.EditFile("container-kill.yaml", "image: \"litmuschaos/ansible-runner:latest\"", "image: "+utils.GetEnv("EXPERIMENT_IMAGE", "litmuschaos/ansible-runner:latest"))
			Expect(err).To(BeNil(), "Failed to update the experiment image")
			err = utils.EditFile("container-kill.yaml", "name: container-kill", "name: container-kill-test")
			Expect(err).To(BeNil(), "Failed to update the experiment name")
			err = exec.Command("kubectl", "apply", "-f", "container-kill.yaml", "-n", "litmus").Run()
			Expect(err).To(BeNil(), "Failed to create chaos experiment")
			klog.Info("Container Kill Chaos Experiment Created Successfully")

			//Installing chaos engine for pod-delete experiment
			//Fetching engine file
			By("Fetching engine file for pod delete experiment")
			err = utils.DownloadFile(experimentName1+"-ce.yaml", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/pod-delete/engine.yaml")
			Expect(err).To(BeNil(), "Fail to fetch chaosengine file for pod delete")

			//Modify chaos engine spec
			err = utils.EditFile(experimentName1+"-ce.yaml", "name: nginx-chaos", "name: "+engineName)
			Expect(err).To(BeNil(), "Failed to update chaosengine name in chaosengine file")
			err = utils.EditFile(experimentName1+"-ce.yaml", "annotationCheck: 'true'", "annotationCheck: 'false'")
			Expect(err).To(BeNil(), "Failed to update AnnotationCheck in engine")
			err = utils.EditFile(experimentName1+"-ce.yaml", "jobCleanUpPolicy: 'delete'", "jobCleanUpPolicy: 'retain'")
			Expect(err).To(BeNil(), "Failed to update jobCleanUpPolicy in chaosengine file of pod-delete")
			err = utils.EditFile(experimentName1+"-ce.yaml", "applabel: 'app=nginx'", "applabel: run=testapp1")
			Expect(err).To(BeNil(), "Failed to update application label in engine")

			//Creating ChaosEngine
			By("Creating ChaosEngine")
			err = exec.Command("kubectl", "apply", "-f", experimentName1+"-ce.yaml").Run()
			Expect(err).To(BeNil(), "Fail to create chaos engine")
			klog.Info("ChaosEngine for pod delete created successfully...")
			time.Sleep(2 * time.Second)

			//Fetching the runner pod and Checking if it gets in Running state or not
			By("Wait for runner pod to come in running sate")
			runnerNamespace1 := "default"
			runnerPodStatus1, err := utils.RunnerPodStatus(runnerNamespace1, engineName, chaosTypes.Client)
			Expect(runnerPodStatus1).NotTo(Equal("1"), "Failed to get in running state")
			Expect(err).To(BeNil(), "Fail to get the runner pod")
			klog.Info("Runner pod for pod delete is in Running state")

			//Installing chaos engine for container kill experiment
			//Fetching engine file
			By("Fetching engine file for container kill")
			//Modify chaos engine spec
			err = utils.DownloadFile(experimentName2+"-ce.yaml", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/generic/container-kill/engine.yaml")
			Expect(err).To(BeNil(), "Fail to fetch chaosengine file for container kill")
			err = utils.EditFile(experimentName2+"-ce.yaml", "name: nginx-chaos", "name: "+engineName)
			Expect(err).To(BeNil(), "Failed to update chaosengine name in chaosengine file for container kill")
			err = utils.EditFile(experimentName2+"-ce.yaml", "namespace: default", "namespace: litmus")
			Expect(err).To(BeNil(), "Failed to update chaosengine namespace")
			err = utils.EditFile(experimentName2+"-ce.yaml", "name: container-kill", "name: container-kill-test")
			Expect(err).To(BeNil(), "Failed to update experiment name in engine file")
			err = utils.EditFile(experimentName2+"-ce.yaml", "annotationCheck: 'true'", "annotationCheck: 'false'")
			Expect(err).To(BeNil(), "Failed to update AnnotationCheck in engine")
			err = utils.EditFile(experimentName2+"-ce.yaml", "jobCleanUpPolicy: 'delete'", "jobCleanUpPolicy: 'retain'")
			Expect(err).To(BeNil(), "Failed to update jobCleanUpPolicy in chaosengine")
			err = utils.EditFile(experimentName2+"-ce.yaml", "applabel: 'app=nginx'", "applabel: run=testapp2")
			Expect(err).To(BeNil(), "Failed to update application label in engine")

			//Creating ChaosEngine
			By("Creating ChaosEngine")
			err = exec.Command("kubectl", "apply", "-f", experimentName2+"-ce.yaml").Run()
			Expect(err).To(BeNil(), "Fail to create chaos engine")
			klog.Info("ChaosEngine for container kill created successfully...")
			time.Sleep(2 * time.Second)

			//Fetching the runner pod and Checking if it gets in Running state or not
			By("Wait for runner pod to come in running sate")
			runnerNamespace2 := chaosTypes.ChaosNamespace
			runnerPodStatus2, err := utils.RunnerPodStatus(runnerNamespace2, engineName, chaosTypes.Client)
			Expect(runnerPodStatus2).NotTo(Equal("1"), "Failed to get in running state")
			Expect(err).To(BeNil(), "Fail to get the runner pod")
			klog.Info("Runner pod for container kill is in Running state")

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
