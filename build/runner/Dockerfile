# Dockerfile of the default image of litmus-portal docker executor
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
RUN pip install --upgrade pip
RUN pip install --upgrade setuptools

# Install Ansible
RUN sudo apt-get update -y \
    && sudo apt-get install -y \
    python3 \
    python3-pip
RUN sudo pip3 install --upgrade pip
RUN sudo -H pip3 install ansible==2.7.4                              

# Installing helm 3
RUN git clone https://github.com/helm/helm.git &&\
    cd helm && make

# Installing kubectl
ADD https://storage.googleapis.com/kubernetes-release/release/v${KUBECTL_VERSION}/bin/linux/amd64/kubectl /usr/local/bin/kubectl
RUN chmod +x /usr/local/bin/kubectl
