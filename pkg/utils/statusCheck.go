package utils

import (
	"fmt"
	"time"

	. "github.com/onsi/gomega"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

//RunnerPodStatus will check the status of runner pod and waits for it to come in running state
func RunnerPodStatus(runnerNamespace string, engineName string, client *kubernetes.Clientset) (int, error) {

	//Fetching the runner pod and Checking if it gets in Running state or not
	runner, err := client.CoreV1().Pods(runnerNamespace).Get(engineName+"-runner", metav1.GetOptions{})
	if err != nil {
		return 0, err
	}
	fmt.Printf("name : %v \n", runner.Name)
	//Running it for infinite time (say 3000 * 10)
	//The Gitlab job will quit if it takes more time than default time (10 min)
	for i := 0; i < 3000; i++ {
		if string(runner.Status.Phase) != "Running" {
			time.Sleep(1 * time.Second)
			runner, err = client.CoreV1().Pods(runnerNamespace).Get(engineName+"-runner", metav1.GetOptions{})
			Expect(err).To(BeNil(), "Fail to get the runner pod")
			Expect(string(runner.Status.Phase)).NotTo(Or(Equal("Succeeded"), Equal("")))
			fmt.Printf("The Runner pod is in %v State \n", runner.Status.Phase)
		} else {
			break
		}
	}

	Expect(string(runner.Status.Phase)).To(Equal("Running"))

	return 0, nil
}
