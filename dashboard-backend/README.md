# Litmus E2E Dashboard Backend

## Requirements

- The server needs to make authenticated requests to GitHub API and to do so it requires a GitHub personal access token.

- Golang version 1.17

## Installation Steps

- Create a GitHub [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).

- Create a file `.env` and add the below content.
```
GITHUB_USERNAME=your_github_username
GITHUB_PAT=your_github_personal_access_token
```

- Replace `your_github_personal_access_token` with the actual token value created in the first step and replace `your_github_username` with the GitHub account from which the token was created.

- Run the below command to install the required dependencies.

```go
go mod download
```

## Run locally

Run the below command to start the server:

```go
go run main.go
```

Go to: http://localhost:8080

## Contributing

We like contributions in several forms, see [CONTRIBUTING.md](https://github.com/litmuschaos/litmus-e2e/blob/master/CONTRIBUTING.md) for more details.
