module github.com/litmuschaos/litmus-e2e

go 1.14

require (
	cloud.google.com/go v0.54.0 // indirect
	github.com/emicklei/go-restful v2.12.0+incompatible // indirect
	github.com/fsnotify/fsnotify v1.4.8 // indirect
	github.com/go-openapi/jsonreference v0.19.3 // indirect
	github.com/go-openapi/spec v0.19.4 // indirect
	github.com/go-openapi/swag v0.19.8 // indirect
	github.com/gogo/protobuf v1.3.1 // indirect
	github.com/google/gofuzz v1.1.0 // indirect
	github.com/googleapis/gnostic v0.4.0 // indirect
	github.com/imdario/mergo v0.3.8 // indirect
	github.com/json-iterator/go v1.1.9 // indirect
	github.com/litmuschaos/chaos-operator v0.0.0-20200310090048-610d15206c2f
	github.com/mailru/easyjson v0.7.1 // indirect
	github.com/onsi/ginkgo v1.12.0
	github.com/onsi/gomega v1.9.0
	github.com/pkg/errors v0.9.1
	github.com/spf13/pflag v1.0.5 // indirect
	golang.org/x/crypto v0.0.0-20200302210943-78000ba7a073 // indirect
	k8s.io/api v0.0.0-20190918195907-bd6ac527cfd2
	k8s.io/apimachinery v0.0.0-20190817020851-f2f3a405f61d
	k8s.io/client-go v0.0.0-20190918200256-06eb1244587a
	k8s.io/klog v1.0.0
	k8s.io/utils v0.0.0-20200229041039-0a110f9eb7ab // indirect
	sigs.k8s.io/controller-runtime v0.3.0 // indirect
	sigs.k8s.io/yaml v1.2.0 // indirect
)

replace gopkg.in/fsnotify.v1 v1.4.8 => github.com/fsnotify/fsnotify v1.4.8
