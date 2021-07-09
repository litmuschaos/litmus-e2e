package pkg

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"

	yamlChe "github.com/ghodss/yaml"
	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/log"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
	corev1 "k8s.io/api/core/v1"
	k8serrors "k8s.io/apimachinery/pkg/api/errors"

	"k8s.io/apimachinery/pkg/api/meta"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/serializer/yaml"
	yamlutil "k8s.io/apimachinery/pkg/util/yaml"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/restmapper"
)

var err error

//CreateChaosResource creates litmus components with given inputs
func CreateChaosResource(fileData []byte, namespace string, clients environment.ClientSets) error {

	decoder := yamlutil.NewYAMLOrJSONDecoder(bytes.NewReader(fileData), 100)

	// for loop to install all the resouces
	for {
		//runtime defines conversions between generic types and structs to map query strings to struct objects.
		var rawObj runtime.RawExtension
		if err = decoder.Decode(&rawObj); err != nil {
			// if the object is null, successfully installed all manifest
			if rawObj.Raw == nil {
				return nil
			}
			return err
		}

		// NewDecodingSerializer adds YAML decoding support to a serializer that supports JSON.
		obj, gvk, _ := yaml.NewDecodingSerializer(unstructured.UnstructuredJSONScheme).Decode(rawObj.Raw, nil, nil)
		unstructuredMap, err := runtime.DefaultUnstructuredConverter.ToUnstructured(obj)
		if err != nil {
			return err
		}
		unstructuredObj := &unstructured.Unstructured{Object: unstructuredMap}

		// GetAPIGroupResources uses the provided discovery client to gather
		// discovery information and populate a slice of APIGroupResources.
		gr, err := restmapper.GetAPIGroupResources(clients.KubeClient.DiscoveryClient)
		if err != nil {
			return err
		}

		mapper := restmapper.NewDiscoveryRESTMapper(gr)

		// RESTMapping returns a struct representing the resource path and conversion interfaces a
		// RESTClient should use to operate on the provided group/kind in order of versions.
		mapping, err := mapper.RESTMapping(gvk.GroupKind(), gvk.Version)
		if err != nil {
			return err
		}

		//ResourceInterface is an API interface to a specific resource under a dynamic client
		var dri dynamic.ResourceInterface
		if mapping.Scope.Name() == meta.RESTScopeNameNamespace {
			unstructuredObj.SetNamespace(namespace)
			dri = clients.DynamicClient.Resource(mapping.Resource).Namespace(unstructuredObj.GetNamespace())
		} else {
			dri = clients.DynamicClient.Resource(mapping.Resource)
		}

		// Create Chaos Resource using dynamic resource interface
		if _, err := dri.Create(unstructuredObj, v1.CreateOptions{}); err != nil {
			if !k8serrors.IsAlreadyExists(err) {
				return err
			} else {
				// Updating present resource
				log.Infof("[Status]: Updating %v", unstructuredObj.GetKind())
				dri.Update(unstructuredObj, v1.UpdateOptions{})
			}
		}
	}
}

//InstallGoRbac installs and configure rbac for running go based chaos
func InstallGoRbac(testsDetails *types.TestDetails, rbacNamespace string) error {

	//Fetch RBAC file
	err = DownloadFile("/tmp/"+testsDetails.ExperimentName+"-sa.yaml", testsDetails.RbacPath)
	if err != nil {
		return errors.Errorf("Fail to fetch the rbac file, due to %v", err)
	}
	//Modify Namespace field of the RBAC
	if rbacNamespace != "" {
		err = EditFile("/tmp/"+testsDetails.ExperimentName+"-sa.yaml", "namespace: default", "namespace: "+rbacNamespace)
		if err != nil {
			return errors.Errorf("Fail to Modify rbac file, due to %v", err)
		}
	}
	log.Info("[RBAC]: Installing RABC...")
	//Creating rbac
	command := []string{"apply", "-f", "/tmp/" + testsDetails.ExperimentName + "-sa.yaml", "-n", rbacNamespace}
	err := Kubectl(command...)
	if err != nil {
		return errors.Errorf("fail to apply rbac file, err: %v", err)
	}
	log.Info("[RBAC]: Rbac installed successfully !!!")

	return nil
}

//InstallGoChaosExperiment installs the given go based chaos experiment
func InstallGoChaosExperiment(testsDetails *types.TestDetails, chaosExperiment *v1alpha1.ChaosExperiment, experimentNamespace string, clients environment.ClientSets) error {

	// contains all the envs
	envDetails := ENVDetails{
		ENV: map[string]string{},
	}

	//Fetch Experiment file
	res, err := http.Get(testsDetails.ExperimentPath)
	if err != nil {
		return errors.Errorf("Fail to fetch the rbac file, due to %v", err)
	}

	// ReadAll reads from response until an error or EOF and returns the data it read.
	fileInput, err := ioutil.ReadAll(res.Body)
	if err != nil {
		log.Errorf("Fail to read data from response: %v", err)
	}

	// Unmarshal decodes the fileInput into chaosExperiment
	err = yamlChe.Unmarshal([]byte(fileInput), &chaosExperiment)
	if err != nil {
		log.Errorf("error when unmarshalling: %v", err)
	}

	// Modify the goExperimentImage
	chaosExperiment.Spec.Definition.Image = testsDetails.GoExperimentImage

	// Modify experiment imagePullPolicy
	chaosExperiment.Spec.Definition.ImagePullPolicy = corev1.PullPolicy(testsDetails.ExperimentImagePullPolicy)

	// Get lib image
	var libImage string
	for _, value := range chaosExperiment.Spec.Definition.ENVList {
		if value.Name == "LIB_IMAGE" {
			libImage = value.Value
		}
	}

	// Modify LIB Image
	if testsDetails.LibImage == "" && strings.Contains(libImage, "go-runner") {
		testsDetails.LibImage = testsDetails.GoExperimentImage
	}

	// Modify ENV's
	envDetails.SetEnv("SEQUENCE", testsDetails.Sequence).
		SetEnv("PODS_AFFECTED_PERC", testsDetails.PodsAffectedPercentage).
		SetEnv("TARGET_PODS", testsDetails.TargetPod).
		SetEnv("LIB", testsDetails.Lib).
		SetEnv("LIB_IMAGE", testsDetails.LibImage)

	log.Info("[LIB Image]: LIB image: " + testsDetails.LibImage + " !!!")

	// update all the values corresponding to keys from the ENV's in Experiment
	for key, value := range chaosExperiment.Spec.Definition.ENVList {
		_, ok := envDetails.ENV[value.Name]
		if ok {
			chaosExperiment.Spec.Definition.ENVList[key].Value = envDetails.ENV[value.Name]
		}
	}

	// Marshal serializes the value provided into a YAML document.
	fileData, err := json.Marshal(chaosExperiment)
	if err != nil {
		return errors.Errorf("fail to marshal ChaosExperiment %v", err)
	}

	log.Info("[Experiment]: Installing Experiment...")

	//Creating experiment
	if err = CreateChaosResource(fileData, testsDetails.ChaosNamespace, clients); err != nil {
		return errors.Errorf("fail to apply experiment file, err: %v", err)
	}
	log.Info("[ChaosExperiment]: Experiment installed successfully !!!")
	log.Info("[Experiment Image]: Chaos Experiment created successfully with image: " + testsDetails.GoExperimentImage + " !!!")

	return nil
}

//InstallGoChaosEngine installs the given go based chaos engine
func InstallGoChaosEngine(testsDetails *types.TestDetails, chaosEngine *v1alpha1.ChaosEngine, engineNamespace string, clients environment.ClientSets) error {

	// contains all the envs
	envDetails := ENVDetails{
		ENV: map[string]string{},
	}

	//Fetch Engine file
	res, err := http.Get(testsDetails.EnginePath)
	if err != nil {
		return errors.Errorf("Fail to fetch the rbac file, due to %v", err)
	}

	// ReadAll reads from response until an error or EOF and returns the data it read.
	fileInput, err := ioutil.ReadAll(res.Body)
	if err != nil {
		log.Errorf("Fail to read data from response: %v", err)
	}

	// Unmarshal decodes the fileInput into chaosEngine
	err = yamlChe.Unmarshal([]byte(fileInput), &chaosEngine)
	if err != nil {
		log.Errorf("error when unmarshalling: %v", err)
	}

	// Add JobCleanUpPolicy of chaos-runner to retain
	chaosEngine.Spec.JobCleanUpPolicy = v1alpha1.CleanUpPolicy(testsDetails.JobCleanUpPolicy)

	// Add ImagePullPolicy of chaos-runner to Always
	chaosEngine.Spec.Components.Runner.ImagePullPolicy = corev1.PullPolicy(testsDetails.ImagePullPolicy)

	// Modify the spec of engine file
	chaosEngine.ObjectMeta.Name = testsDetails.EngineName
	chaosEngine.ObjectMeta.Namespace = engineNamespace

	// If ChaosEngine contain App Info then update it
	if chaosEngine.Spec.Appinfo.Appns != "" && chaosEngine.Spec.Appinfo.Applabel != "" {
		chaosEngine.Spec.Appinfo.Appns = testsDetails.AppNS
		chaosEngine.Spec.Appinfo.Applabel = testsDetails.AppLabel
	}
	chaosEngine.Spec.ChaosServiceAccount = testsDetails.ChaosServiceAccount
	chaosEngine.Spec.Experiments[0].Name = testsDetails.NewExperimentName
	chaosEngine.Spec.AnnotationCheck = testsDetails.AnnotationCheck

	switch testsDetails.ExperimentName {
	case "ec2-terminate-by-id":
		envDetails.SetEnv("EC2_INSTANCE_ID", testsDetails.InstanceID).
			SetEnv("REGION", testsDetails.Region)
	case "ec2-terminate-by-tag":
		envDetails.SetEnv("INSTANCE_TAG", testsDetails.InstanceTag).
			SetEnv("REGION", testsDetails.Region)
	case "ebs-loss-by-id":
		envDetails.SetEnv("EBS_VOLUME_ID", testsDetails.EBSVolumeID).
			SetEnv("REGION", testsDetails.Region)
	case "ebs-loss-by-tag":
		envDetails.SetEnv("EBS_VOLUME_TAG", testsDetails.EBSVolumeTag).
			SetEnv("REGION", testsDetails.Region)
	}

	// for experiments like pod network latency
	envDetails.SetEnv("NETWORK_LATENCY", testsDetails.NetworkLatency)

	// update Engine if FillPercentage if it does not match criteria
	if testsDetails.FillPercentage != 80 {
		envDetails.SetEnv("FILL_PERCENTAGE", strconv.Itoa(testsDetails.FillPercentage))
	}

	// update App Node Details
	if testsDetails.ApplicationNodeName != "" {
		envDetails.SetEnv("TARGET_NODE", testsDetails.ApplicationNodeName)
		if chaosEngine.Spec.Experiments[0].Spec.Components.NodeSelector == nil {
			chaosEngine.Spec.Experiments[0].Spec.Components.NodeSelector = map[string]string{}
		}
		chaosEngine.Spec.Experiments[0].Spec.Components.NodeSelector["kubernetes.io/hostname"] = testsDetails.NodeSelectorName
	}

	// CHAOS_KILL_COMMAND for pod-memory-hog and pod-cpu-hog
	switch testsDetails.ExperimentName {
	case "pod-cpu-hog":
		chaosEngine.Spec.Experiments[0].Spec.Components.ENV = append(chaosEngine.Spec.Experiments[0].Spec.Components.ENV, corev1.EnvVar{
			Name:  "CHAOS_KILL_COMMAND",
			Value: testsDetails.CPUKillCommand,
		})
	case "pod-memory-hog":
		chaosEngine.Spec.Experiments[0].Spec.Components.ENV = append(chaosEngine.Spec.Experiments[0].Spec.Components.ENV, corev1.EnvVar{
			Name:  "CHAOS_KILL_COMMAND",
			Value: testsDetails.MemoryKillCommand,
		})
	}

	// update all the value corresponding to keys from the ENV's in Engine
	for key, value := range chaosEngine.Spec.Experiments[0].Spec.Components.ENV {
		_, ok := envDetails.ENV[value.Name]
		if ok {
			chaosEngine.Spec.Experiments[0].Spec.Components.ENV[key].Value = envDetails.ENV[value.Name]
		}
	}

	// Marshal serializes the values provided into a YAML document.
	fileData, err := json.Marshal(chaosEngine)
	if err != nil {
		return errors.Errorf("Fail to marshal ChaosEngine %v", err)
	}

	//Creating chaos engine
	log.Info("[Engine]: Installing ChaosEngine...")
	if err = CreateChaosResource(fileData, testsDetails.ChaosNamespace, clients); err != nil {
		return errors.Errorf("fail to apply engine file, err: %v", err)
	}
	log.Info("[Engine]: ChaosEngine Installed Successfully !!!")
	return nil
}

//InstallLitmus installs the latest version of litmus
func InstallLitmus(testsDetails *types.TestDetails) error {

	log.Info("Installing Litmus ...")
	if err := DownloadFile("install-litmus.yaml", testsDetails.InstallLitmus); err != nil {
		return errors.Errorf("Fail to fetch litmus operator file, due to %v", err)
	}
	log.Info("Updating ChaosOperator Image ...")
	if err := EditFile("install-litmus.yaml", "image: litmuschaos/chaos-operator:latest", "image: "+testsDetails.OperatorImage); err != nil {
		return errors.Errorf("Unable to update operator image, due to %v", err)

	}
	if err = EditKeyValue("install-litmus.yaml", "  - chaos-operator", "imagePullPolicy: Always", "imagePullPolicy: "+testsDetails.ImagePullPolicy); err != nil {
		return errors.Errorf("Unable to update image pull policy, due to %v", err)
	}
	log.Info("Updating Chaos Runner Image ...")
	if err := EditKeyValue("install-litmus.yaml", "CHAOS_RUNNER_IMAGE", "value: \"litmuschaos/chaos-runner:latest\"", "value: '"+testsDetails.RunnerImage+"'"); err != nil {
		return errors.Errorf("Unable to update runner image, due to %v", err)
	}
	//Creating engine
	command := []string{"apply", "-f", "install-litmus.yaml"}
	err := Kubectl(command...)
	if err != nil {
		return errors.Errorf("fail to apply litmus installation file, err: %v", err)
	}
	log.Info("Litmus installed successfully !!!")

	return nil
}

//InstallAdminRbac installs admin rbac to run chaos
func InstallAdminRbac(testsDetails *types.TestDetails) error {

	//Fetch RBAC file

	err = DownloadFile("/tmp/"+testsDetails.ExperimentName+"-sa.yaml", testsDetails.AdminRbacPath)
	if err != nil {
		return errors.Errorf("Fail to fetch the rbac file, due to %v", err)
	}
	//Modify Namespace field of the RBAC
	err = EditFile("/tmp/"+testsDetails.ExperimentName+"-sa.yaml", "namespace: litmus", "namespace: "+testsDetails.ChaosNamespace)
	if err != nil {
		return errors.Errorf("Fail to Modify admin rbac file, due to %v", err)
	}
	//Creating admin rbac
	log.Info("[Admin]: Installing Litmus in Administrator Mode")
	command := []string{"apply", "-f", "/tmp/" + testsDetails.ExperimentName + "-sa.yaml", "-n", testsDetails.ChaosNamespace}
	err := Kubectl(command...)
	if err != nil {
		return errors.Errorf("fail to apply admin rbac file, err: %v", err)
	}
	log.Info("[Admin]: Admin RBAC installed successfully !!!")

	return nil
}
