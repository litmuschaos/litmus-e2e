package pkg

import (
	"bytes"
	"encoding/json"
	"sort"
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

// CreateChaosResource creates litmus components with given inputs
func CreateChaosResource(testsDetails *types.TestDetails, fileData []byte, namespace string, clients environment.ClientSets) error {

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
				if unstructuredObj.GetKind() == "ChaosEngine" {
					return UpdateEngine(testsDetails, clients)
				} else if unstructuredObj.GetKind() == "ChaosExperiment" {
					return UpdateExperiment(testsDetails, clients)
				}
			}
		}
	}
}

// UpdateEngine updating engine
func UpdateEngine(testsDetails *types.TestDetails, clients environment.ClientSets) error {
	engine, err := clients.LitmusClient.ChaosEngines(testsDetails.ChaosNamespace).Get(testsDetails.EngineName, v1.GetOptions{})
	if err != nil {
		return err
	}

	// setting the EngineState of chaosEngine to Active
	engine.Spec.EngineState = v1alpha1.EngineStateActive

	// Set all environments
	if err = setEngineVar(engine, testsDetails, types.SetupAppInfoIfEmpty); err != nil {
		return err
	}

	_, err = clients.LitmusClient.ChaosEngines(testsDetails.ChaosNamespace).Update(engine)
	if err != nil {
		return err
	}
	return nil
}

// UpdateExperiment updating experiment
func UpdateExperiment(testsDetails *types.TestDetails, clients environment.ClientSets) error {
	experiment, err := clients.LitmusClient.ChaosExperiments(testsDetails.ChaosNamespace).Get(testsDetails.ExperimentName, v1.GetOptions{})
	if err != nil {
		return errors.Errorf("Failed to update experiment, err: %v", err)
	}

	// Set all environments
	setExperimentVar(experiment, testsDetails)

	_, err = clients.LitmusClient.ChaosExperiments(testsDetails.ChaosNamespace).Update(experiment)
	if err != nil {
		return errors.Errorf("Failed to get experiment,err: %v", err)
	}
	return nil
}

// InstallGoRbac installs and configure rbac for running go based chaos
func InstallGoRbac(testsDetails *types.TestDetails, rbacNamespace string) error {

	//Fetch RBAC file
	err = DownloadFile("/tmp/"+testsDetails.ExperimentName+"-sa.yaml", testsDetails.RbacPath)
	if err != nil {
		return errors.Errorf("Failed to fetch the rbac file due to %v", err)
	}
	//Modify Namespace field of the RBAC
	if rbacNamespace != "" {
		err = EditFile("/tmp/"+testsDetails.ExperimentName+"-sa.yaml", "namespace: litmus", "namespace: "+rbacNamespace)
		if err != nil {
			return errors.Errorf("Failed to Modify rbac file due to %v", err)
		}
	}
	err = EditFile("/tmp/"+testsDetails.ExperimentName+"-sa.yaml", "litmus-admin", testsDetails.ExperimentName+"-sa")
	if err != nil {
		return errors.Errorf("Failed to Modify rbac file due to %v", err)
	}
	log.Info("[RBAC]: Installing RBAC...")
	//Creating rbac
	command := []string{"apply", "-f", "/tmp/" + testsDetails.ExperimentName + "-sa.yaml", "-n", rbacNamespace}
	err := Kubectl(command...)
	if err != nil {
		return errors.Errorf("Failed to apply rbac file, err: %v", err)
	}
	log.Info("[RBAC]: Rbac installed successfully !!!")

	return nil
}

// setExperimentVar setting up variables of experiment
func setExperimentVar(chaosExperiment *v1alpha1.ChaosExperiment, testsDetails *types.TestDetails) {

	// contains all the envs
	envDetails := ENVDetails{
		ENV: map[string]string{},
	}

	// Modify the ExperimentImage
	chaosExperiment.Spec.Definition.Image = testsDetails.ExperimentImage
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
		testsDetails.LibImage = testsDetails.ExperimentImage
	} else {
		testsDetails.LibImage = libImage
	}

	// Modify Args
	if testsDetails.Args != "" {
		chaosExperiment.Spec.Definition.Args = strings.Split(testsDetails.Args, ",")
	}

	// Modify Image Command
	if testsDetails.Command != "" {
		chaosExperiment.Spec.Definition.Command = strings.Split(testsDetails.Command, ",")
	}

	// Modify ENV's
	envDetails.SetEnv("SEQUENCE", testsDetails.Sequence).
		SetEnv("PODS_AFFECTED_PERC", testsDetails.PodsAffectedPercentage).
		SetEnv("TARGET_PODS", testsDetails.TargetPod).
		SetEnv("LIB", testsDetails.Lib).
		SetEnv("LIB_IMAGE", testsDetails.LibImage)

	log.Info("[LIB Image]: Lib image is " + testsDetails.LibImage + " !!!")

	// update all the values corresponding to keys from the ENV's in Experiment
	for key, value := range chaosExperiment.Spec.Definition.ENVList {
		_, ok := envDetails.ENV[value.Name]
		if ok {
			chaosExperiment.Spec.Definition.ENVList[key].Value = envDetails.ENV[value.Name]
		}
	}
}

// InstallGoChaosExperiment installs the given go based chaos experiment
func InstallGoChaosExperiment(testsDetails *types.TestDetails, chaosExperiment *v1alpha1.ChaosExperiment, experimentNamespace string, clients environment.ClientSets) error {

	//Fetch Experiment file
	fileInput, err := FetchManifest(testsDetails.ExperimentPath)
	if err != nil {
		return errors.Errorf("Failed to fetch the experiment file due to %v", err)
	}

	// Unmarshal decodes the fileInput into chaosExperiment
	if err = yamlChe.Unmarshal(fileInput, &chaosExperiment); err != nil {
		return errors.Errorf("Failed to unmarshal the experiment file from %v due to %v", testsDetails.ExperimentPath, err)
	}
	if chaosExperiment.Kind != "ChaosExperiment" {
		return errors.Errorf("The file at %v is not a ChaosExperiment, got kind %q", testsDetails.ExperimentPath, chaosExperiment.Kind)
	}

	// Initialise experiment
	setExperimentVar(chaosExperiment, testsDetails)

	// Marshal serializes the value provided into a YAML document.
	fileData, err := json.Marshal(chaosExperiment)
	if err != nil {
		return errors.Errorf("Failed to marshal ChaosExperiment %v", err)
	}

	log.Info("[Experiment]: Installing Experiment...")

	//Creating experiment
	if err = CreateChaosResource(testsDetails, fileData, testsDetails.ChaosNamespace, clients); err != nil {
		return errors.Errorf("Failed to apply experiment file, err: %v", err)
	}
	log.Info("[ChaosExperiment]: Experiment installed successfully !!!")
	log.Info("[Experiment Image]: Chaos Experiment created successfully with image: " + testsDetails.ExperimentImage + " !!!")

	return nil
}

// setEngineVar setting up variables of engine
// It returns an error when an experiment specific input has no matching env in the engine,
// as the experiment would otherwise run silently without the target the test asked for.
func setEngineVar(chaosEngine *v1alpha1.ChaosEngine, testsDetails *types.TestDetails, setAppInfo bool) error {

	// contains all the envs
	envDetails := ENVDetails{
		ENV: map[string]string{},
	}

	// Add JobCleanUpPolicy of chaos-runner to retain
	chaosEngine.Spec.JobCleanUpPolicy = v1alpha1.CleanUpPolicy(testsDetails.JobCleanUpPolicy)

	// Add ImagePullPolicy of chaos-runner to Always
	chaosEngine.Spec.Components.Runner.ImagePullPolicy = corev1.PullPolicy(testsDetails.ImagePullPolicy)

	// Modify the spec of engine file
	chaosEngine.ObjectMeta.Name = testsDetails.EngineName
	chaosEngine.ObjectMeta.Namespace = testsDetails.ChaosNamespace

	// If ChaosEngine contain App Info then update it
	if setAppInfo {
		chaosEngine.Spec.Appinfo.Appns = testsDetails.AppNS
		chaosEngine.Spec.Appinfo.Applabel = testsDetails.AppLabel
		chaosEngine.Spec.Appinfo.AppKind = testsDetails.Appkind
	}
	if testsDetails.ChaosServiceAccount != "" {
		chaosEngine.Spec.ChaosServiceAccount = testsDetails.ChaosServiceAccount
	} else {
		chaosEngine.Spec.ChaosServiceAccount = testsDetails.ExperimentName + "-sa"
	}
	chaosEngine.Spec.Experiments[0].Name = testsDetails.NewExperimentName
	chaosEngine.Spec.AnnotationCheck = testsDetails.AnnotationCheck

	switch testsDetails.ExperimentName {
	case "ec2-stop-by-id":
		envDetails.SetEnv("EC2_INSTANCE_ID", testsDetails.InstanceID).
			SetEnv("REGION", testsDetails.Region)
	case "ec2-stop-by-tag":
		envDetails.SetEnv("EC2_INSTANCE_TAG", testsDetails.InstanceTag).
			SetEnv("REGION", testsDetails.Region)
	case "ebs-loss-by-id":
		envDetails.SetEnv("EBS_VOLUME_ID", testsDetails.EBSVolumeID).
			SetEnv("REGION", testsDetails.Region)
	case "ebs-loss-by-tag":
		envDetails.SetEnv("EBS_VOLUME_TAG", testsDetails.EBSVolumeTag).
			SetEnv("REGION", testsDetails.Region)
	case "disk-fill":
		if testsDetails.FillPercentage != 80 {
			envDetails.SetEnv("FILL_PERCENTAGE", strconv.Itoa(testsDetails.FillPercentage))
		}
		// Here not using SetEnv function as SetEnv will not add new variables
		chaosEngine.Spec.Experiments[0].Spec.Components.ENV = append(chaosEngine.Spec.Experiments[0].Spec.Components.ENV, corev1.EnvVar{
			Name:  "EPHEMERAL_STORAGE_MEBIBYTES",
			Value: "200",
		})
	case "pod-cpu-hog-exec":
		chaosEngine.Spec.Experiments[0].Spec.Components.ENV = append(chaosEngine.Spec.Experiments[0].Spec.Components.ENV, corev1.EnvVar{
			Name:  "CHAOS_KILL_COMMAND",
			Value: testsDetails.CPUKillCommand,
		})
	case "pod-memory-hog-exec":
		chaosEngine.Spec.Experiments[0].Spec.Components.ENV = append(chaosEngine.Spec.Experiments[0].Spec.Components.ENV, corev1.EnvVar{
			Name:  "CHAOS_KILL_COMMAND",
			Value: testsDetails.MemoryKillCommand,
		})
	case "azure-instance-stop":
		envDetails.SetEnv("RESOURCE_GROUP", testsDetails.AzureResourceGroup).
			SetEnv("AZURE_INSTANCE_NAMES", testsDetails.AzureInstanceName).
			SetEnv("SCALE_SET", testsDetails.AzureScaleSet)
	case "azure-disk-loss":
		envDetails.SetEnv("RESOURCE_GROUP", testsDetails.AzureResourceGroup).
			SetEnv("SCALE_SET", testsDetails.AzureScaleSet).
			SetEnv("VIRTUAL_DISK_NAMES", testsDetails.AzureDiskName)
	case "gcp-vm-instance-stop":
		envDetails.SetEnv("GCP_PROJECT_ID", testsDetails.GCPProjectID).
			SetEnv("VM_INSTANCE_NAMES", testsDetails.VMInstanceNames).
			SetEnv("ZONES", testsDetails.InstanceZones)
	case "gcp-vm-disk-loss":
		envDetails.SetEnv("GCP_PROJECT_ID", testsDetails.GCPProjectID).
			SetEnv("DISK_VOLUME_NAMES", testsDetails.DiskVolumeNames).
			SetEnv("ZONES", testsDetails.DiskZones)
	case "vmware-vm-poweroff":
		envDetails.SetEnv("APP_VM_MOIDS", testsDetails.VMIds)
	case "process-kill":
		envDetails.SetEnv("PROCESS_IDS", testsDetails.ProcessIds)
	}

	// inputs set so far are specific to the experiment and must be present in the engine
	requiredEnv := map[string]bool{}
	for key := range envDetails.ENV {
		requiredEnv[key] = true
	}

	// for experiments like pod network latency
	envDetails.SetEnv("NETWORK_LATENCY", testsDetails.NetworkLatency)

	// experiments that talk to the container runtime of the node
	envDetails.SetEnv("CONTAINER_RUNTIME", testsDetails.ContainerRuntime).
		SetEnv("SOCKET_PATH", testsDetails.SocketPath)

	// update App Node Details
	if testsDetails.ApplicationNodeName != "" {
		envDetails.SetEnv("TARGET_NODE", testsDetails.ApplicationNodeName)
		if chaosEngine.Spec.Experiments[0].Spec.Components.NodeSelector == nil {
			chaosEngine.Spec.Experiments[0].Spec.Components.NodeSelector = map[string]string{}
		}
		chaosEngine.Spec.Experiments[0].Spec.Components.NodeSelector["kubernetes.io/hostname"] = testsDetails.NodeSelectorName
	}

	// update Target Node Details
	if testsDetails.TargetNodes != "" {
		log.Infof("[Info] Target Nodes: %v", testsDetails.TargetNodes)
		envDetails.SetEnv("TARGET_NODES", testsDetails.TargetNodes)
	}

	// NODE_LABEL for Node-memory-hog and node-cpu-hog
	if testsDetails.NodeLabel != "" {
		chaosEngine.Spec.Experiments[0].Spec.Components.ENV = append(chaosEngine.Spec.Experiments[0].Spec.Components.ENV, corev1.EnvVar{
			Name:  "NODE_LABEL",
			Value: testsDetails.NodeLabel,
		})
	}

	// update all the value corresponding to keys from the ENV's in Engine
	applied := map[string]bool{}
	for key, value := range chaosEngine.Spec.Experiments[0].Spec.Components.ENV {
		_, ok := envDetails.ENV[value.Name]
		if ok {
			chaosEngine.Spec.Experiments[0].Spec.Components.ENV[key].Value = envDetails.ENV[value.Name]
			applied[value.Name] = true
		}
	}

	var missing []string
	for key := range envDetails.ENV {
		if applied[key] {
			continue
		}
		if requiredEnv[key] {
			missing = append(missing, key)
		} else {
			log.Infof("[Warning]: env %v is not defined in the engine of %v, it is not applied", key, testsDetails.NewExperimentName)
		}
	}
	if len(missing) > 0 {
		sort.Strings(missing)
		return errors.Errorf("env %v not defined in the engine of %v, the engine manifest and the e2e inputs are out of sync", missing, testsDetails.NewExperimentName)
	}
	return nil
}

// InstallGoChaosEngine installs the given go based chaos engine
func InstallGoChaosEngine(testsDetails *types.TestDetails, chaosEngine *v1alpha1.ChaosEngine, engineNamespace string, setAppInfo bool, clients environment.ClientSets) error {
	return installGoChaosEngine(testsDetails, chaosEngine, engineNamespace, setAppInfo, clients, nil)
}

// InstallGoChaosEngineWithFailingProbe installs the engine with a cmdProbe that can never succeed, so that the
// experiment ends with the Fail verdict while the target is found and the chaos is injected. The probe is added to the
// json document, the typed ChaosEngine of the pinned operator library does not know the current run properties.
func InstallGoChaosEngineWithFailingProbe(testsDetails *types.TestDetails, chaosEngine *v1alpha1.ChaosEngine, engineNamespace string, clients environment.ClientSets) error {
	failing := map[string]interface{}{
		"name": "always-failing-probe",
		"type": "cmdProbe",
		"mode": "EOT",
		"cmdProbe/inputs": map[string]interface{}{
			"command":    "echo present",
			"comparator": map[string]interface{}{"type": "string", "criteria": "contains", "value": "absent"},
		},
		"runProperties": map[string]interface{}{"probeTimeout": "5s", "interval": "2s", "retry": 1},
	}
	addProbe := func(doc map[string]interface{}) error {
		spec, _ := doc["spec"].(map[string]interface{})
		exps, _ := spec["experiments"].([]interface{})
		if len(exps) == 0 {
			return errors.Errorf("the ChaosEngine has no experiment to add a probe to")
		}
		exp, _ := exps[0].(map[string]interface{})
		expSpec, _ := exp["spec"].(map[string]interface{})
		if expSpec == nil {
			expSpec = map[string]interface{}{}
			exp["spec"] = expSpec
		}
		expSpec["probe"] = []interface{}{failing}
		return nil
	}
	return installGoChaosEngine(testsDetails, chaosEngine, engineNamespace, types.SetupAppInfoIfEmpty, clients, addProbe)
}

func installGoChaosEngine(testsDetails *types.TestDetails, chaosEngine *v1alpha1.ChaosEngine, engineNamespace string, setAppInfo bool, clients environment.ClientSets, mutate func(map[string]interface{}) error) error {

	//Fetch Engine file
	fileInput, err := FetchManifest(testsDetails.EnginePath)
	if err != nil {
		return errors.Errorf("Failed to fetch the engine file due to %v", err)
	}

	// Unmarshal decodes the fileInput into chaosEngine
	if err = yamlChe.Unmarshal(fileInput, &chaosEngine); err != nil {
		return errors.Errorf("Failed to unmarshal the engine file from %v due to %v", testsDetails.EnginePath, err)
	}
	if chaosEngine.Kind != "ChaosEngine" || len(chaosEngine.Spec.Experiments) == 0 {
		return errors.Errorf("The file at %v is not a ChaosEngine with an experiment", testsDetails.EnginePath)
	}

	// Initialise engine
	if err = setEngineVar(chaosEngine, testsDetails, setAppInfo); err != nil {
		return err
	}

	// Marshal serializes the values provided into a YAML document.
	fileData, err := json.Marshal(chaosEngine)
	if err != nil {
		return errors.Errorf("Failed to marshal ChaosEngine %v", err)
	}
	if mutate != nil {
		doc := map[string]interface{}{}
		if err = json.Unmarshal(fileData, &doc); err != nil {
			return errors.Errorf("Failed to read back the ChaosEngine %v", err)
		}
		if err = mutate(doc); err != nil {
			return err
		}
		if fileData, err = json.Marshal(doc); err != nil {
			return errors.Errorf("Failed to marshal ChaosEngine %v", err)
		}
	}

	//Creating chaos engine
	log.Info("[Engine]: Installing ChaosEngine...")
	if err = CreateChaosResource(testsDetails, fileData, testsDetails.ChaosNamespace, clients); err != nil {
		return errors.Errorf("Failed to apply engine file, err: %v", err)
	}
	log.Info("[Engine]: ChaosEngine Installed Successfully !!!")
	return nil
}

// InstallLitmus installs the latest version of litmus
func InstallLitmus(testsDetails *types.TestDetails) error {

	log.Info("Installing Litmus ...")
	if err := DownloadFile("install-litmus.yaml", testsDetails.InstallLitmus); err != nil {
		return errors.Errorf("Failed to fetch litmus operator file due to %v", err)
	}
	log.Info("Updating ChaosOperator Image ...")
	if err := EditFile("install-litmus.yaml", "image: litmuschaos.docker.scarf.sh/litmuschaos/chaos-operator:latest", "image: "+testsDetails.OperatorImage); err != nil {
		return errors.Errorf("Unable to update operator image due to %v", err)

	}
	if err = EditNextMatch("install-litmus.yaml", "image: "+testsDetails.OperatorImage, "imagePullPolicy: Always", "imagePullPolicy: "+testsDetails.ImagePullPolicy); err != nil {
		return errors.Errorf("Unable to update image pull policy due to %v", err)
	}
	log.Info("Updating Chaos Runner Image ...")
	if err := EditKeyValue("install-litmus.yaml", "CHAOS_RUNNER_IMAGE", "value: \"litmuschaos.docker.scarf.sh/litmuschaos/chaos-runner:latest\"", "value: '"+testsDetails.RunnerImage+"'"); err != nil {
		return errors.Errorf("Unable to update runner image due to %v", err)
	}
	//Creating engine
	command := []string{"apply", "-f", "install-litmus.yaml"}
	err := Kubectl(command...)
	if err != nil {
		return errors.Errorf("Failed to apply litmus installation file, err: %v", err)
	}
	log.Info("Litmus installed successfully !!!")

	return nil
}

// InstallAdminRbac installs admin rbac to run chaos
func InstallAdminRbac(testsDetails *types.TestDetails) error {

	//Fetch RBAC file

	err = DownloadFile("/tmp/"+testsDetails.ExperimentName+"-sa.yaml", testsDetails.AdminRbacPath)
	if err != nil {
		return errors.Errorf("Failed to fetch the rbac file due to %v", err)
	}
	//Modify Namespace field of the RBAC
	err = EditFile("/tmp/"+testsDetails.ExperimentName+"-sa.yaml", "namespace: litmus", "namespace: "+testsDetails.ChaosNamespace)
	if err != nil {
		return errors.Errorf("Failed to Modify admin rbac file due to %v", err)
	}
	//Creating admin rbac
	log.Info("[Admin]: Installing Litmus in Administrator Mode")
	command := []string{"apply", "-f", "/tmp/" + testsDetails.ExperimentName + "-sa.yaml", "-n", testsDetails.ChaosNamespace}
	err := Kubectl(command...)
	if err != nil {
		return errors.Errorf("Failed to apply admin rbac file, err: %v", err)
	}
	log.Info("[Admin]: Admin RBAC installed successfully !!!")

	return nil
}



