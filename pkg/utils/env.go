package utils

import (
	"os"
)

// GetEnv gets the environment variable, if not present assign a default variable
func GetEnv(key, defaultvalue string) string {
	value, exists := os.LookupEnv(key)
	if !exists {
		value = defaultvalue
	}
	return value
}
