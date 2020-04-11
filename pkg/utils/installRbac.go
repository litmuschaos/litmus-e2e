package rbac

import (
	"os/exec"

	"github.com/pkg/errors"
	"k8s.io/client-go/kubernetes"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
)

var (
	err error
)

// InstallRbac function is for the Rbac Creation for indivisual experiments. we need to pass the address
// (From the chaos chart) of the Rbac file and the name of experiment and it will create the Rbac
// for the file.
func InstallRbac(rbacPath string, rbacNamespace string, experimentName string, client *kubernetes.Clientset) error {

	//Installing RBAC for the experiment
	//Fetching RBAC file
	err = DownloadFile(experimentName+"-sa.yaml", rbacPath)
	if err != nil {
		return errors.Wrapf(err, "Fail to fetch the experiment file, due to %v", err)
	}
	//Modify Namespace field of the RBAC
	err = EditFile(experimentName+"-sa.yaml", "namespace: default", "namespace: "+rbacNamespace)
	if err != nil {
		return errors.Wrapf(err, "Fail to Modify experiment file, due to %v", err)
	}
	err = exec.Command("kubectl", "apply", "-f", experimentName+"-sa.yaml").Run()
	if err != nil {
		return errors.Wrapf(err, "Fail to create the file,due to %v", err)
	}

	return nil
}
