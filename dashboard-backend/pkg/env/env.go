package env

import (
	"os"

	"github.com/joho/godotenv"
	"github.com/litmuschaos/litmus-go/pkg/log"
)

func GoDotEnvVariable(key string) string {
	// load .env file
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	return os.Getenv(key)
}
