package status

import (
	"fmt"
	"time"

	"github.com/pkg/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

//RunnerPodStatus will check the status of runner pod and waits for it to come in running state
func RunnerPodStatus(runnerNamespace string, engineName string, client *kubernetes.Clientset) (int, error) {

	//Fetching the runner pod and Checking if it gets in Running state or not
	runner, err := client.CoreV1().Pods(runnerNamespace).Get(engineName+"-runner", metav1.GetOptions{})
	if err != nil {
		return 0, errors.Wrapf(err, "Fail to get the runner pod status, due to:%v", err)
	}
	fmt.Printf("name : %v \n", runner.Name)
	//Running it for infinite time (say 3000 * 10)
	//The Gitlab job will quit if it takes more time than default time (10 min)
	for i := 0; i < 3000; i++ {
		if string(runner.Status.Phase) != "Running" {
			time.Sleep(1 * time.Second)
			runner, err = client.CoreV1().Pods(runnerNamespace).Get(engineName+"-runner", metav1.GetOptions{})
			if err != nil {
				return 0, errors.Wrapf(err, "Fail to get the runner pod status after sleep, due to:%v", err)
			}
			if runner.Status.Phase == "Succeeded" || runner.Status.Phase == "" {
				return 1, nil
			}
			fmt.Printf("The Runner pod is in %v State \n", runner.Status.Phase)
		} else {
			break
		}
	}
	if runner.Status.Phase != "Running" {
		return 1, nil
	}
	return 0, nil
}
