package tests

import (
	"fmt"
	"os"
	"os/exec"
	"testing"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
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
)

func TestChaos(t *testing.T) {

	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

var _ = AfterSuite(func() {
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

	//Removing All Downloaded files
	By("Removing all Downloaded files")
	err = exec.Command("rm", "-rf", "openebs-operator-1.2.0.yaml*").Run()
	Expect(err).To(BeNil(), "fail to remove downloaded files")
	if err != nil {
		fmt.Println(err)
	}

	//Removing SPC
	By("Deleting SPC")
	err = exec.Command("kubectl", "delete", "spc", "--all").Run()
	Expect(err).To(BeNil(), "failed to delete spc")
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("SPC is deleted successfully")

	//Removing PV
	By("Deleting Pv")
	err = exec.Command("kubectl", "delete", "pv", "-n", "openebs", "--all").Run()
	Expect(err).To(BeNil(), "failed to delete pv")
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("PV is deleted successfully")

	//Removing Blockdevices
	By("Deleting Blockdevices")
	err = exec.Command("kubectl", "delete", "bd", "-n", "openebs", "--all").Run()
	Expect(err).To(BeNil(), "failed to delete the blockdevices")
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("Blockdevices deleted successfully")

	//Removing the deployment components
	By("Deleting deployment components")
	err = exec.Command("kubectl", "delete", "deploy", "-n", "openebs", "--all").Run()
	Expect(err).To(BeNil(), "failed to delete the deployment components")
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("deployment components are deleted successfully")

	//Removing OpenEBS NDM DaemonSet
	By("Deleting OpenEBS NDM DaemonSet")
	err = exec.Command("kubectl", "delete", "ds", "-n", "openebs", "--all").Run()
	Expect(err).To(BeNil(), "failed to delete the daemonset")
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("NDM Daemonset is deleted successfully")

	//Removing openebs crds
	By("Deleting openebs crds")
	err = exec.Command("kubectl", "delete", "crds", "--all").Run()
	Expect(err).To(BeNil(), "failed to delete all crds")
	if err != nil {
		fmt.Println(err)
	}
	time.Sleep(5 * time.Second)

	fmt.Println("crds are deleted successfully")

	//Removing litmus and openebs namespaces
	By("Deleting litmus and openebs namespaces")
	err = exec.Command("kubectl", "delete", "ns", "litmus", "openebs").Run()
	time.Sleep(2 * time.Second)

	fmt.Println("Namespaces deleted successfully")

})
