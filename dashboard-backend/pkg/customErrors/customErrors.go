package customErrors

import (
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus-go/pkg/log"
)

// HandleError sends JSON object containing error message
func HandleError(c *gin.Context, err error) {
	log.Errorf("exiting with error %s", err.Error())
	c.JSON(400, gin.H{
		"status": "error",
		"error":  err.Error(),
	})
}

// Success returns the success message string
func Success() string {
	return "OK"
}

// InternalServerError returns error interface for internal server error
func InternalServerError() error {
	return errors.New("internal server error")
}

// NonSuccessStatusCode returns error interface for status code greater than 299
func NonSuccessStatusCode(statusCode int) error {
	return errors.New("Request failed with status code " + strconv.Itoa(statusCode))
}
