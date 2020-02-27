package utils

import (
	"os/exec"

	"k8s.io/client-go/kubernetes"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
)

var (
	err error
)

// This function is for the Rbac Creation for indivisual experiments. we need to pass the address
// (From the chaos chart) of the Rbac file and the name of experiment and it will create the Rbac
// for the file.
func InstallRbac(rbacPath string, experimentName string, client *kubernetes.Clientset) (int, error) {

	//Installing RBAC for the experiment
	//Fetching RBAC file
	err = exec.Command("wget", "-O", experimentName+"-sa.yaml", rbacPath).Run()
	if err != nil {
		return 1, err
	}
	//Modify Namespace field of the RBAC
	err = exec.Command("sed", "-i", `s/namespace: default/namespace: litmus/g`, experimentName+"-sa.yaml").Run()
	if err != nil {
		return 1, err
	}
	err = exec.Command("kubectl", "apply", "-f", experimentName+"-sa.yaml").Run()
	if err != nil {
		return 1, err
	}

	return 0, nil
}
