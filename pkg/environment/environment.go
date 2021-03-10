package environment

import (
	"os"

	types "github.com/litmuschaos/litmus-e2e/pkg/types"
)

//GetENV fetches all the env variables from the runner pod
func GetENV(testDetails *types.TestDetails, expName, engineName string) {
	testDetails.UpdateWebsite = Getenv("UPDATE_WEBSITE", "false")
	testDetails.Version = Getenv("RUN_VERSION", "ci")
}

// Getenv fetch the env and set the default value, if any
func Getenv(key string, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		value = defaultValue
	}
	return value
}
