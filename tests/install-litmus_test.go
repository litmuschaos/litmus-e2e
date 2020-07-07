package tests

import (
	"bytes"
	"fmt"
	"os/exec"
	"testing"
	"time"

	"github.com/litmuschaos/litmus-e2e/pkg/utils"
	chaosTypes "github.com/litmuschaos/litmus-e2e/types"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	scheme "k8s.io/client-go/kubernetes/scheme"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	"k8s.io/klog"

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

var (
	out    bytes.Buffer
	stderr bytes.Buffer
)

func TestInstallLitmus(t *testing.T) {

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

//BDD Tests to Install Litmus
var _ = Describe("BDD of Litmus installation", func() {

	// BDD TEST CASE 1
	Context("Check for the Litmus components", func() {

		It("Should check for creation of Litmus", func() {

			//Installing Litmus
			By("Installing Litmus")
			var err error
			klog.Info("Installing Litmus")
			err = utils.DownloadFile("install-litmus.yaml", chaosTypes.InstallLitmus)
			Expect(err).To(BeNil(), "fail to fetch operator yaml file to install litmus")
			klog.Info("Updating Operator Image")
			err = utils.EditFile("install-litmus.yaml", "image: litmuschaos/chaos-operator:latest", "image: "+utils.GetEnv("OPERATOR_IMAGE", "litmuschaos/chaos-operator:latest"))
			Expect(err).To(BeNil(), "Failed to update the operator image")
			err = utils.EditKeyValue("install-litmus.yaml", "  - chaos-operator", "imagePullPolicy: Always", "imagePullPolicy: "+utils.GetEnv("IMAGE_PULL_POLICY", "Always"))
			Expect(err).To(BeNil(), "Failed to update the image pull policy")
			klog.Info("Updating Runner Image")
			err = utils.EditKeyValue("install-litmus.yaml", "CHAOS_RUNNER_IMAGE", "value: \"litmuschaos/chaos-runner:latest\"", "value: '"+utils.GetEnv("RUNNER_IMAGE", "litmuschaos/chaos-runner:latest")+"'")
			Expect(err).To(BeNil(), "Failed to update chaos interval")
			cmd := exec.Command("kubectl", "apply", "-f", "install-litmus.yaml")
			cmd.Stdout = &out
			cmd.Stderr = &stderr
			err = cmd.Run()
			if err != nil {
				klog.Infof(fmt.Sprint(err) + ": " + stderr.String())
				fmt.Println(err)
				Fail("Fail to install litmus")
			}
			klog.Infof("Result: " + out.String())

			//Checking the status of operator
			operator, _ := chaosTypes.Client.AppsV1().Deployments(utils.GetEnv("APP_NS", "default")).Get("chaos-operator-ce", metav1.GetOptions{})
			count := 0
			for operator.Status.UnavailableReplicas != 0 {
				if count < 50 {
					klog.Infof("Unavaliable Count: %v \n", operator.Status.UnavailableReplicas)
					operator, _ = chaosTypes.Client.AppsV1().Deployments(utils.GetEnv("APP_NS", "default")).Get("chaos-operator-ce", metav1.GetOptions{})
					time.Sleep(5 * time.Second)
					count++
				} else {
					Fail("Operator is not in Ready state Time Out")
				}
			}
			klog.Info("Chaos Operator created successfully")
			klog.Info("Litmus installed successfully")
		})
	})

})
