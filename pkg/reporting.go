package pkg

import (
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/reporters"
)

// JUnitReportDirEnv is the env holding the directory where the JUnit reports of the suites are written
const JUnitReportDirEnv = "JUNIT_REPORT_DIR"

// RunSpecs runs the specs of the calling test file.
// When JUNIT_REPORT_DIR is set a JUnit report named after the test file (without the _test.go suffix)
// is written to that directory, it is the input of the nightly report.
func RunSpecs(t *testing.T, description string) {
	dir := os.Getenv(JUnitReportDirEnv)
	if dir == "" {
		ginkgo.RunSpecs(t, description)
		return
	}

	_, file, _, _ := runtime.Caller(1)
	name := strings.TrimSuffix(filepath.Base(file), "_test.go")
	if err := os.MkdirAll(dir, 0755); err != nil {
		t.Fatalf("unable to create the report directory %v: %v", dir, err)
	}
	ginkgo.RunSpecsWithDefaultAndCustomReporters(t, name, []ginkgo.Reporter{
		reporters.NewJUnitReporter(filepath.Join(dir, name+".xml")),
	})
}
