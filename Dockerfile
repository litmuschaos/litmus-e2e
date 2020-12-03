# Dockerfile of the default image of litmus-generic-e2e docker executor
FROM golang:1.13

ARG ANSIBLE_VERSION=2.7.4~ubuntu16.04.1
ARG KUBECTL_VERSION=1.18.0

# Install generally useful things
RUN rm -rf /var/lib/apt/lists/*
RUN apt-get update                                          \
  && apt-get -y --force-yes install --no-install-recommends     \
    curl                                                    \
    dnsutils                                                \
    git                                                     \
    jq                                                      \
    net-tools                                               \
    ssh                                                     \
    sshpass                                                 \
    telnet                                                  \
    unzip                                                   \
    vim                                                     \
    wget                                                    \
    python                                                  \
    python-pip                                              \
    bash                                                    \
    sudo                                                    \
    software-properties-common                              \
    apt-transport-https

# Update pip version
RUN pip install --upgrade pip && \
    pip install --upgrade setuptools

# Install Ansible
RUN sudo apt-get update -y \
    && sudo apt-get install -y \
    python3 \
    python3-pip
RUN sudo pip3 install --upgrade pip && \
    sudo -H pip3 install ansible==2.7.4 && \
    python3 -m pip install pygithub                           

#Installing helm
RUN wget https://get.helm.sh/helm-v3.4.0-linux-amd64.tar.gz && \ 
    tar -zxvf helm-v3.4.0-linux-amd64.tar.gz && \
    mv linux-amd64/helm /usr/local/bin/helm

# Installing kubectl
ADD https://storage.googleapis.com/kubernetes-release/release/v${KUBECTL_VERSION}/bin/linux/amd64/kubectl /usr/local/bin/kubectl
RUN chmod +x /usr/local/bin/kubectl

COPY . .