package customErrors

import (
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus-go/pkg/log"
)

func HandleError(c *gin.Context, err error) {
	log.Errorf("exiting with error %s", err.Error())
	c.JSON(400, gin.H{
		"status": "error",
		"error":  err.Error(),
	})
}

func Success() string {
	return "OK"
}

func InternalServerError() error {
	return errors.New("internal server error")
}

func NonSuccessStatusCode(statusCode int) error {
	return errors.New("Request failed with status code " + strconv.Itoa(statusCode))
}
