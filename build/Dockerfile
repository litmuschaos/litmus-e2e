FROM alpine:3.12

ENV TERM=xterm

ARG KUBECTL_VERSION=1.18.0

RUN rm -rf /var/lib/apt/lists/*

# Install generally useful things
RUN apk --update add \
    sudo \
    bash\
    make\
    openssl\
    python3\
    py3-pip \
    git \
    curl

# Update pip version
RUN sudo pip3 install --upgrade pip

#Install AWS CLI
RUN sudo -H pip3 install awscliv2 --upgrade

# Install Kubectl
RUN curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl && chmod +x ./kubectl && sudo mv ./kubectl /usr/local/bin/kubectl && kubectl version --client

# Install AWS IAM AUTHENTICATOR
RUN sudo curl -o /usr/local/bin/aws-iam-authenticator https://amazon-eks.s3.us-west-2.amazonaws.com/1.18.9/2020-11-02/bin/linux/amd64/aws-iam-authenticator && sudo chmod +x /usr/local/bin/aws-iam-authenticator

# Install eksctl 
RUN curl --silent --location "https://github.com/weaveworks/eksctl/releases/download/latest_release/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp && sudo mv /tmp/eksctl /usr/local/bin && eksctl version

# Install Helm
RUN curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 && chmod 700 get_helm.sh && ./get_helm.sh

# Change default shell from ash to bash
RUN sed -i -e "s/bin\/ash/bin\/bash/" /etc/passwd  

RUN aws --version