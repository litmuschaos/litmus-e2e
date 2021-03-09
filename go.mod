module github.com/Jonsy13/portal-e2e-aws

go 1.13

require (
	github.com/google/gofuzz v1.2.0 // indirect
	github.com/onsi/ginkgo v1.15.1
	github.com/onsi/gomega v1.11.0
	github.com/stretchr/testify v1.7.0 // indirect
	golang.org/x/oauth2 v0.0.0-20210220000619-9bb904979d93 // indirect
	golang.org/x/time v0.0.0-20210220033141-f8bda1e9f3ba // indirect
	k8s.io/api v0.20.4 // indirect
	k8s.io/client-go v12.0.0+incompatible
	k8s.io/klog v1.0.0
	k8s.io/utils v0.0.0-20210305010621-2afb4311ab10 // indirect
)

// Pinned to kubernetes-1.16.2
replace k8s.io/api => k8s.io/api v0.0.0-20191016110408-35e52d86657a
