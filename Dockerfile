FROM golang:latest

LABEL maintainer="LitmusChaos"
RUN apt-get update && apt-get install -y git && \
    apt-get install -y ssh && \
    apt install ssh rsync

ENV GOPATH=/home/udit/go
ENV PATH=$PATH:/usr/local/go/bin:$GOPATH/bin
ARG KUBECTL_VERSION=1.17.0

RUN apt-get update && apt-get install -y python-pip && \
    pip install --upgrade pip && \
    pip install --upgrade setuptools


RUN apt-get update -y \
    && apt-get install -y \
    python3 \
    python3-pip
RUN pip3 install --upgrade pip
RUN python3 -m pip install pygithub

ADD https://storage.googleapis.com/kubernetes-release/release/v${KUBECTL_VERSION}/bin/linux/amd64/kubectl /usr/local/bin/kubectl
RUN chmod +x /usr/local/bin/kubectl

COPY build ./build
COPY Gopkg.lock ./Gopkg.lock
COPY Gopkg.lock ./Gopkg.toml
COPY Makefile ./
COPY nginx ./nginx
COPY pkg ./pkg
COPY result_update.py /
COPY tests ./tests
COPY types ./types
COPY utils ./utils
COPY vendor ./vendor

