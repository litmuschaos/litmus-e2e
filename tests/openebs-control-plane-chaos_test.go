package test

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"os/exec"
	"testing"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	scheme "k8s.io/client-go/kubernetes/scheme"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	"k8s.io/client-go/tools/clientcmd"

	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	chaosClient "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus-e2e/pkg/utils"
	restclient "k8s.io/client-go/rest"
)

var (
	kubeconfig     string
	config         *restclient.Config
	client         *kubernetes.Clientset
	clientSet      *chaosClient.LitmuschaosV1alpha1Client
	err            error
	image_tag      = os.Getenv("IMAGE_TAG")
	experimentName = "openebs-control-plane-chaos"
	engineName     = "engine2"
)

func TestChaos(t *testing.T) {

	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

var _ = BeforeSuite(func() {
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

	//Getting the Application Status
	app, _ := client.AppsV1().Deployments("openebs").Get("percona", metav1.GetOptions{})
	count := 0
	for app.Status.UnavailableReplicas != 0 {
		if count < 50 {
			fmt.Printf("Percona is Getting Ready, Currently Unavaliable Count is: %v \n", app.Status.UnavailableReplicas)
			app, _ = client.AppsV1().Deployments("openebs").Get("percona", metav1.GetOptions{})
			time.Sleep(10 * time.Second)
			count++
		} else {
			Fail("Application fails to get in Ready state")
		}
	}

})

//BDD Tests for openebs control plane chaos filure
var _ = Describe("BDD of openebs control plane chaos experiment", func() {

	// BDD TEST CASE 1
	Context("Check for the components of openebs", func() {

		It("Should check for creation of runner pod", func() {

			//Installing RBAC for the experiment
			//Fetching rbac file
			rbacPath := "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/openebs/openebs-control-plane-chaos/rbac.yaml"
			installrbac, err := utils.InstallRbac(rbacPath, experimentName, client)
			Expect(installrbac).To(Equal(0), "Fail to create rbac file")
			Expect(err).To(BeNil(), "Fail to create RBAC")
			fmt.Println("Rbac has been created successfully !!!")

			//Creating Chaos-Experiment
			By("Creating Experiment")
			err = exec.Command("wget", "-O", experimentName+"-exp.yaml", "https://hub.litmuschaos.io/api/chaos?file=charts/openebs/openebs-control-plane-chaos/experiment.yaml").Run()
			Expect(err).To(BeNil(), "fail get chaos experiment")
			err = exec.Command("sed", "-i", `s/ansible-runner:latest/ansible-runner:`+image_tag+`/g`, experimentName+"-exp.yaml").Run()
			Expect(err).To(BeNil(), "fail to edit chaos experiment yaml")
			err = exec.Command("kubectl", "apply", "-f", experimentName+"-exp.yaml", "-n", "openebs").Run()
			Expect(err).To(BeNil(), "fail to create chaos experiment")
			fmt.Println("Chaos Experiment Created Successfully")

			//Installing chaos engine for the experiment
			//Fetching engine file
			By("Fetching engine file for the experiment")
			err = exec.Command("wget", "-O", experimentName+"-ce.yaml", "https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/openebs/openebs-control-plane-chaos/engine.yaml").Run()
			Expect(err).To(BeNil(), "Fail to fetch engine file")
			//Modify chaos engine spec
			//Modify Namespace,Name,AppNs,AppLabel of the engine

			err = exec.Command("sed", "-i",
				`s/name: control-plane-chaos/name: engine2/g;
			     s/jobCleanUpPolicy: 'delete'/jobCleanUpPolicy: 'retain'/g`,
				experimentName+"-ce.yaml").Run()

			Expect(err).To(BeNil(), "Fail to change the fields of the engine")

			//Creating ChaosEngine
			By("Creating ChaosEngine")
			err = exec.Command("kubectl", "apply", "-f", experimentName+"-ce.yaml").Run()
			Expect(err).To(BeNil(), "Fail to create chaos engine")
			if err != nil {
				fmt.Println(err)
			}
			fmt.Println("ChaosEngine created successfully...")
			time.Sleep(2 * time.Second)

			//Fetching the runner pod and Checking if it get in Running state or not
			By("Wait for chaos-runner to come in running sate")
			runner, err := client.CoreV1().Pods("openebs").Get(engineName+"-runner", metav1.GetOptions{})
			fmt.Printf("name : %v \n", runner.Name)
			//Running it for infinite time (say 3000 * 10)
			//The Gitlab job will quit if it takes more time than default time (10 min)
			for i := 0; i < 3000; i++ {
				if string(runner.Status.Phase) != "Running" {
					time.Sleep(1 * time.Second)
					runner, _ = client.CoreV1().Pods("openebs").Get(engineName+"-runner", metav1.GetOptions{})
					Expect(string(runner.Status.Phase)).NotTo(Or(Equal("Succeeded"), Equal("")), "The runner pod is either succeeded or not created")
					fmt.Printf("The Runner pod is in %v State \n", runner.Status.Phase)
				} else {
					break
				}
			}
			Expect(err).To(BeNil(), "Fail to get the runner pod")
			Expect(string(runner.Status.Phase)).To(Equal("Running"))
			time.Sleep(5 * time.Second)

			// Getting the list of job pods for the experiment
			By("Getting Job pod status and waiting to get completed")
			job, err := client.CoreV1().Pods("openebs").List(metav1.ListOptions{LabelSelector: "name=" + experimentName})
			Expect(err).To(BeNil(), "Fail to list the job pod")

			// Getting the pod from the list of pods
			for _, podList := range job.Items {
				//Waiting of some infinite time (3000s) for the compition of job
				//If job gets stuck, then Gitlab job will fail after deafult time(10m)
				for i := 0; i < 300; i++ {
					if string(podList.Status.Phase) != "Succeeded" {
						time.Sleep(10 * time.Second)
						//Getting the jobList again after waiting 10s
						jobPod, err := client.CoreV1().Pods("openebs").List(metav1.ListOptions{LabelSelector: "name=" + experimentName})
						Expect(err).To(BeNil(), "Fail to get the job list")

						flag := true
						//Getting the pod from jobList after 10s of wait
						for _, jobList := range jobPod.Items {
							if string(jobList.Status.Phase) != "Succeeded" {
								fmt.Printf("Currently, the experiment job pod is in %v State, Please Wait for its completion\n", jobList.Status.Phase)
							} else {
								flag = false
								Expect(string(jobList.Status.Phase)).To(Equal("Succeeded"))
								break
							}
						}
						if flag == false {
							break
						}

					} else {
						break
					}
				}

			}
			//Getting the jobList after the job gets completed
			By("Getting Experiment Job pod logs")
			for _, pod := range job.Items {
				jobPodName := (pod.Name)
				fmt.Printf("JobPodName : %v \n\n\n", jobPodName)
				// After the Job gets completed further commands will print the logs.
				req := client.CoreV1().Pods("openebs").GetLogs(jobPodName, &v1.PodLogOptions{})
				readCloser, err := req.Stream()
				if err != nil {
					fmt.Println("Error2: ", err)
				} else {
					buf := new(bytes.Buffer)
					_, err = io.Copy(buf, readCloser)
					fmt.Println("Experiment logs : \n\n", buf.String())
				}
			}

			//Checking the chaosresult
			By("Checking the chaosresult")
			app, err := clientSet.ChaosResults("openebs").Get(engineName+"-"+experimentName, metav1.GetOptions{})
			Expect(string(app.Status.ExperimentStatus.Verdict)).To(Equal("Pass"), "Verdict is not pass chaosresult")
			Expect(err).To(BeNil(), "Fail to get chaosresult")

		})
	})
	// BDD for pipeline result update
	Context("Check for the result update", func() {

		It("Should check for the result updation", func() {

			//Updating the result table
			By("Updating the result table")
			pipelineResult, err := utils.ResultUpdate(experimentName, engineName, clientSet)
			Expect(pipelineResult).NotTo(Equal("1"), "Failed  to update the job result in a table")
			Expect(err).To(BeNil(), "Fail run the script for result updation")
			fmt.Println("Result updated successfully !!!")
		})
	})
})
