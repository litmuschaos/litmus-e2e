package pkg

import (
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestFetchManifest(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/ok":
			w.Write([]byte("kind: ChaosEngine\n"))
		case "/missing":
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte("404: Not Found"))
		case "/hub-error":
			// the ChaosHub API reports a missing file with a 200 status
			w.Write([]byte("file content parsing error, err : unable to read file"))
		case "/empty":
			w.Write([]byte("  \n"))
		}
	}))
	defer srv.Close()

	tests := []struct {
		name    string
		path    string
		wantErr string
	}{
		{"valid file", "/ok", ""},
		{"http error status", "/missing", "unexpected status"},
		{"hub error body with 200", "/hub-error", "file content parsing error"},
		{"empty body", "/empty", "empty response"},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			data, err := FetchManifest(srv.URL + tc.path)
			if tc.wantErr == "" {
				if err != nil || string(data) != "kind: ChaosEngine\n" {
					t.Fatalf("unexpected result %q, %v", data, err)
				}
				return
			}
			if err == nil || !strings.Contains(err.Error(), tc.wantErr) {
				t.Fatalf("expected error containing %q, got %v", tc.wantErr, err)
			}
		})
	}
}

func TestDownloadFileDoesNotWriteInvalidContent(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	}))
	defer srv.Close()

	target := filepath.Join(t.TempDir(), "out.yaml")
	if err := DownloadFile(target, srv.URL); err == nil {
		t.Fatal("expected an error for a 404 response")
	}
	if _, err := os.Stat(target); !os.IsNotExist(err) {
		t.Fatal("the file must not be created when the download fails")
	}
}

func TestEditNextMatch(t *testing.T) {
	content := "image: other\nimagePullPolicy: Always\nimage: op:ci\nimagePullPolicy: Always\nimagePullPolicy: Always\n"
	target := filepath.Join(t.TempDir(), "m.yaml")
	if err := ioutil.WriteFile(target, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}
	if err := EditNextMatch(target, "image: op:ci", "imagePullPolicy: Always", "imagePullPolicy: IfNotPresent"); err != nil {
		t.Fatal(err)
	}
	got, _ := ioutil.ReadFile(target)
	want := "image: other\nimagePullPolicy: Always\nimage: op:ci\nimagePullPolicy: IfNotPresent\nimagePullPolicy: Always\n"
	if string(got) != want {
		t.Fatalf("got\n%s\nwant\n%s", got, want)
	}
	if err := EditNextMatch(target, "image: missing", "imagePullPolicy", "x"); err == nil {
		t.Fatal("expected an error when the key is not found")
	}
}

func TestGetImageTag(t *testing.T) {
	for image, want := range map[string]string{
		"litmuschaos/go-runner:ci":                    "ci",
		"litmuschaos.docker.scarf.sh/x/go-runner:3.0": "3.0",
		"localhost:5000/go-runner":                    "latest",
		"litmuschaos/go-runner":                       "latest",
		"localhost:5000/go-runner:dev":                "dev",
	} {
		if got := GetImageTag(image); got != want {
			t.Errorf("GetImageTag(%q) = %q, want %q", image, got, want)
		}
	}
}
