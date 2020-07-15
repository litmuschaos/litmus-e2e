package utils

import (
	"flag"
	"os"

	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

// GetKubeConfig setup the config for access cluster resource
func GetKubeConfig() (*rest.Config, error) {
	command := flag.NewFlagSet(os.Args[0], flag.ExitOnError)
	Kubeconfig := command.String("kubeconfig", os.Getenv("HOME")+"/.kube/config", "absolute path to the kubeconfig file")
	flag.Parse()
	// Use in-cluster config if kubeconfig path is specified
	if *Kubeconfig == "" {
		Config, err := rest.InClusterConfig()
		if err != nil {
			return Config, err
		}
	}
	Config, err := clientcmd.BuildConfigFromFlags("", *Kubeconfig)
	if err != nil {
		return Config, err
	}
	return Config, err
}
