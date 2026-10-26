package pkg

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"time"

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

// EditNextMatch replaces old with new on the first line containing it that follows the first line containing key
func EditNextMatch(filepath, key, old, new string) error {
	fileData, err := ioutil.ReadFile(filepath)
	if err != nil {
		return errors.Wrapf(err, "Failed to read the given file due to:%v", err)
	}
	lines := strings.Split(string(fileData), "\n")

	keyFound := false
	for i, line := range lines {
		if !keyFound {
			keyFound = strings.Contains(line, key)
			continue
		}
		if strings.Contains(line, old) {
			lines[i] = strings.Replace(line, old, new, 1)
			return ioutil.WriteFile(filepath, []byte(strings.Join(lines, "\n")), 0644)
		}
	}
	return errors.Errorf("Error in updating \"%v\", no match found after \"%v\" please check the file", old, key)
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

// hubErrorPrefix is the body returned by the ChaosHub API (with HTTP 200) when the requested file does not exist
const hubErrorPrefix = "file content parsing error"

// FetchManifest downloads a manifest and fails when the server did not return a usable file.
// The ChaosHub API answers missing files with HTTP 200 and an error message as the body,
// so the status code alone cannot be trusted.
func FetchManifest(url string) ([]byte, error) {
	client := http.Client{Timeout: 60 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("Failed to get the data from %v: %w", url, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Failed to get the data from %v: unexpected status %v", url, resp.Status)
	}
	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("Failed to read the data from %v: %w", url, err)
	}
	if len(bytes.TrimSpace(data)) == 0 {
		return nil, fmt.Errorf("Failed to get the data from %v: empty response", url)
	}
	if strings.HasPrefix(strings.TrimSpace(string(data)), hubErrorPrefix) {
		return nil, fmt.Errorf("Failed to get the data from %v: %v", url, strings.TrimSpace(string(data)))
	}
	return data, nil
}

// DownloadFile will download a url to a local file, only the validated content is written
func DownloadFile(filepath string, url string) error {

	data, err := FetchManifest(url)
	if err != nil {
		return err
	}

	// Write the body to file
	if err := ioutil.WriteFile(filepath, data, 0644); err != nil {
		return fmt.Errorf("Failed to write the data in file: %w", err)
	}
	return nil
}

func Int32Ptr(i int32) *int32 { return &i }
