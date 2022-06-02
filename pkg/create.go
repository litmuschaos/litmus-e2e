package pkg

import (
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/log"
	"github.com/pkg/errors"
	appv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// CreateDeployment will create a deployment
func CreateDeployment(clients environment.ClientSets, deploymentName, image, namespace string) error {

	deployment := &appv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name: deploymentName,
		},
		Spec: appv1.DeploymentSpec{
			Replicas: Int32Ptr(1),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"run": deploymentName,
				},
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"run": deploymentName,
					},
				},
				Spec: apiv1.PodSpec{
					Containers: []apiv1.Container{
						{
							Name:  deploymentName,
							Image: image,
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
	_, err := clients.KubeClient.AppsV1().Deployments(namespace).Create(deployment)
	if err != nil {
		log.Infof(""+deploymentName+" deployment is not created and error is ", err)
		return errors.Errorf("Failed to create "+deploymentName+" deployment due to %v", err)
	}
	log.Info("" + deploymentName + " deployment is created successfully !!!")

	return nil
}

// CreateNamespace is used to create a namespace
func CreateNamespace(clients environment.ClientSets, namespaceName string) error {
	nsSpec := &apiv1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespaceName}}
	if _, err := clients.KubeClient.CoreV1().Namespaces().Create(nsSpec); err != nil {
		return errors.Errorf("Failed to create "+namespaceName+" namespace due to %v", err)
	}
	log.Infof("[Info]: %v namespace created successfully!!!", namespaceName)
	return nil
}
