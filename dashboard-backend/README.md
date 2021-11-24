# Litmus E2E Dashboard Backend

## Requirements

- The server needs to make authenticated requests to GitHub API and to do so it requires a GitHub personal access token.

- Golang version 1.17

## Installation Steps

- Create a GitHub [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

- Create a file `.env` and add the below content.
```
GITHUB_USERNAME=your_github_username
GITHUB_PAT=your_github_personal_access_token
```

- Replace `your_github_personal_access_token` with the actual token value created in first step and replace `your_github_username` with the GitHub account from which the token was created.
