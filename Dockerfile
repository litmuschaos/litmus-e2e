# Dockerfile of the default image of litmus-generic-e2e docker executor
FROM golang:alpine

ARG KUBECTL_VERSION=1.18.0

# Install generally useful things
RUN rm -rf /var/lib/apt/lists/*

RUN apk --update add \
        git \
        python3\
        py3-pip \
        rsync \
        sshpass

# Update pip version
RUN python3 -m pip install pygithub                        

#Installing helm
RUN wget https://get.helm.sh/helm-v3.4.0-linux-amd64.tar.gz && \ 
    tar -zxvf helm-v3.4.0-linux-amd64.tar.gz && \
    mv linux-amd64/helm /usr/local/bin/helm

# Installing kubectl
ADD https://storage.googleapis.com/kubernetes-release/release/v${KUBECTL_VERSION}/bin/linux/amd64/kubectl /usr/local/bin/kubectl
RUN chmod +x /usr/local/bin/kubectl
WORKDIR /go/src/
COPY ansible/ engine/ experiment/ go.mod  go.sum   ./
COPY Makefile  metrics/  nginx/  operator/  pkg/  tests/  utils/ ./
