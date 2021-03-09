package environment

import (
	"os"

	types "github.com/Jonsy13/portal-e2e-aws/pkg/types"
)

//GetENV fetches all the env variables from the runner pod
func GetENV(testDetails *types.TestDetails, expName, engineName string) {
	testDetails.UpdateWebsite = Getenv("UPDATE_WEBSITE", "false")
}

// Getenv fetch the env and set the default value, if any
func Getenv(key string, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		value = defaultValue
	}
	return value
}
