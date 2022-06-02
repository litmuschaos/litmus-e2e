package engine

import (
	"testing"

	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus-e2e/pkg"
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/log"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
)

func TestAnnotationCheck(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests for annotation-check in engine
//The test is performed over pod-delete experiment
//where wrong annotation check is provided and we test if experiment gets fail
var _ = Describe("BDD of annotation check test", func() {

	// BDD TEST CASE 1
	Context("Check for litmus components", func() {

		It("Should check for creation of runner pod", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}
			chaosExperiment := v1alpha1.ChaosExperiment{}
			chaosEngine := v1alpha1.ChaosEngine{}

			var err error
			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err = clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			log.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-delete", "annotation-check-engine")

			// Checking the chaos operator running status
			By("[Status]: Checking chaos operator status")
			err = pkg.OperatorStatusCheck(&testsDetails, clients)
			Expect(err).To(BeNil(), "Operator status check failed due to {%v}", err)

			//Remove application annotation
			By("[Annotate]: Remove the application annotation")
			err = pkg.AddAnnotation("nginx", "litmuschaos.io/chaos", "false", testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Failed to add annotation before test due to {%v}", err)

			// Prepare Chaos Execution
			By("[Prepare]: Prepare Chaos Execution")
			// Providing wrong annotation-check true
			// in ChaosEngine and false in application
			err = pkg.PrepareChaos(&testsDetails, &chaosExperiment, &chaosEngine, clients, true)
			Expect(err).To(BeNil(), "Failed to prepare chaos due to {%v}", err)

			//Checking runner pod creation
			By("[Status]: Runner pod running status check")
			err = pkg.RunnerPodStatus(&testsDetails, testsDetails.AppNS, clients)
			Expect(err).NotTo(BeNil(), "[TEST FAILED]: Runner pod created when the application is not annotated")

			//Chaos pod running status check
			err = pkg.ChaosPodStatus(&testsDetails, clients)
			Expect(err).NotTo(BeNil(), "[TEST FAILED]: chaos pod created when application pod is not annotated")

			//Waiting for chaos pod to get completed
			//And Print the logs of the chaos pod
			//The chaos pod logs should not get printed
			By("[Status]: Wait for chaos pod completion and then print logs")
			err = pkg.ChaosPodLogs(&testsDetails, clients)
			Expect(err).NotTo(BeNil(), "[TEST FAILED]: Chaos pod created when the application is not annotated")

			//Checking the chaosresult verdict
			By("[Verdict]: Checking the chaosresult verdict")
			_, err = pkg.GetChaosResultVerdict(&testsDetails, clients)
			Expect(err).NotTo(BeNil(), "[TEST FAILED]: ChaosResult created when the application is not annotated and the annotationCheck is marked as true!")

		})
	})
	// BDD for checking ChaosEngine experiments status
	Context("Check for chaos engine experiments status", func() {

		It("Should check for the verdict of engine", func() {

			testsDetails := types.TestDetails{}
			clients := environment.ClientSets{}

			//Getting kubeConfig and Generate ClientSets
			By("[PreChaos]: Getting kubeconfig and generate clientset")
			err := clients.GenerateClientSetFromKubeConfig()
			Expect(err).To(BeNil(), "Unable to Get the kubeconfig due to {%v}", err)

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			log.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pod-delete", "annotation-check-engine")

			//Revert the application annotation
			By("[Annotate]: Remove the application annotation")
			err = pkg.AddAnnotation("nginx", "litmuschaos.io/chaos", "true", testsDetails.ChaosNamespace)
			Expect(err).To(BeNil(), "Failed to add annotation after test due to {%v}", err)

			//Checking chaosengine verdict
			By("Checking the Verdict of Chaos Engine")
			chaosEngine, _ := clients.LitmusClient.ChaosEngines(testsDetails.ChaosNamespace).Get(testsDetails.EngineName, metav1.GetOptions{})
			Expect(len(chaosEngine.Status.Experiments)).To(Equal(0), "[TEST FAILED]: ChaosEngine experiments status is not nil")

		})
	})
	// BDD for cleaning all components
	Context("cleanup for litmus components", func() {

		It("Should delete all the litmus CRs", func() {

			By("[Cleanup]: Removing Litmus Components")
			err := pkg.Cleanup()
			Expect(err).To(BeNil(), "Failed to delete all litmus components due to {%v}", err)

		})
	})
})
