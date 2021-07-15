package utils

import (
	"crypto/rand"
)

// GetRandomString returns a string of a given length
func GetRandomString(length int) string {

	var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-"

	charCount := len(chars)
	randomByteSlice := make([]byte, length)

	//generate random bytes and assign them to randomByteSlice
	rand.Read(randomByteSlice)

	for i := 0; i < length; i++ {
		randomByteSlice[i] = chars[int(randomByteSlice[i])%charCount]
	}

	return string(randomByteSlice)
}
