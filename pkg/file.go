package pkg

import (
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strings"

	"github.com/pkg/errors"
)

// EditFile will edit the content of a file
func EditFile(filepath, old, new string) error {
	failFlag := true
	fileData, err := ioutil.ReadFile(filepath)
	if err != nil {
		return errors.Wrapf(err, "Failed to read the given file due to:%v", err)
	}
	lines := strings.Split(string(fileData), "\n")

	for i, line := range lines {
		if strings.Contains(line, old) {
			lines[i] = strings.ReplaceAll(lines[i], old, new)
			failFlag = false
		}
	}
	if failFlag {
		return errors.Errorf("Error in updating \"%v\" please check the file", old)
	}
	output := strings.Join(lines, "\n")
	err = ioutil.WriteFile(filepath, []byte(output), 0644)
	if err != nil {
		return errors.Wrapf(err, "Failed to write the data in the given file due to:%v", err)
	}

	return nil
}

// EditKeyValue will edit the value according to key content of the file
func EditKeyValue(filepath, key, oldvalue, newvalue string) error {
	failFlag := true
	fileData, err := ioutil.ReadFile(filepath)
	if err != nil {
		return errors.Wrapf(err, "Failed to read the given file due to:%v", err)
	}
	lines := strings.Split(string(fileData), "\n")

	for i, line := range lines {
		if strings.Contains(line, key) {
			lines[i+1] = strings.ReplaceAll(lines[i+1], oldvalue, newvalue)
			failFlag = false
		}
	}
	if failFlag {
		return errors.Errorf("Error in updating \"%v\" please check the file", oldvalue)
	}
	output := strings.Join(lines, "\n")
	err = ioutil.WriteFile(filepath, []byte(output), 0644)
	if err != nil {
		return errors.Wrapf(err, "Failed to write the data in the given file due to:%v", err)
	}

	return nil
}

// AddAfterMatch will add a new line when a match is found
func AddAfterMatch(filepath, key, newvalue string) error {
	failFlag := true
	fileData, err := ioutil.ReadFile(filepath)
	if err != nil {
		return errors.Wrapf(err, "Failed to read the given file due to:%v", err)
	}
	lines := strings.Split(string(fileData), "\n")

	for i, line := range lines {
		if strings.Contains(line, key) {
			lines = append(lines, "")
			copy(lines[i+2:], lines[i+1:])
			lines[i+1] = newvalue
			failFlag = false
		}
	}
	if failFlag {
		return errors.Errorf("Error in adding \"%v\", \"%v\" not found ", newvalue, key)
	}
	output := strings.Join(lines, "\n")
	err = ioutil.WriteFile(filepath, []byte(output), 0644)
	if err != nil {
		return errors.Wrapf(err, "Failed to write the data in the given file due to:%v", err)
	}

	return nil
}

// DownloadFile will download a url to a local file. It's efficient because it will
// write as it downloads and not load the whole file into memory.
func DownloadFile(filepath string, url string) error {

	// Get the data
	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("Failed to get the data: %w", err)
	}
	defer resp.Body.Close()

	// Create the file
	out, err := os.Create(filepath)
	if err != nil {
		return fmt.Errorf("Failed to create the file: %w", err)
	}
	defer out.Close()

	// Write the body to file
	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return fmt.Errorf("Failed to write the data in file: %w", err)
	}
	return nil
}

func Int32Ptr(i int32) *int32 { return &i }
