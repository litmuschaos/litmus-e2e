package env

import (
	"os"

	"github.com/joho/godotenv"
	"github.com/litmuschaos/litmus-go/pkg/log"
)

// GoDotEnvVariable loads the environment variable value for a key
func GoDotEnvVariable(key string) string {
	err := godotenv.Load(".env")
	if err != nil {
		log.Errorf("Error loading .env file")
	}

	return os.Getenv(key)
}
