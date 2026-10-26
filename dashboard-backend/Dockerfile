FROM golang:alpine

LABEL maintainer="LitmusChaos"

RUN mkdir /usr/app

WORKDIR /usr/app

COPY go.mod ./
COPY go.sum ./

RUN go mod download

COPY . .

RUN go build -o /dashboard-backend

EXPOSE 8080

CMD [ "/dashboard-backend" ]
