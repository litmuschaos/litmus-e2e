# STEPS TO CONTRIBUTE

1. Find an issue to work on or create a new issue at [https://github.com/litmuschaos/litmus-e2e/issues](https://github.com/litmuschaos/litmus-e2e/issues) if you find a bug/suggest a new feature addition/change.

2. Fork the main repository to create a duplicate copy for yourself.

3. Clone the `gh-pages` branch of `litmus-e2e` repository
```
  git clone -b gh-pages https://github.com/litmuschaos/litmus-e2e.git
```

4. Create a feature branch in the forked repository and always send a PR from the feature-branch to the `gh-pages` branch of the upstream repository.

```
  Example- Aman-Codes/modal-component -> litmus-e2e/gh-pages
```

## PULL REQUEST SPECIFICATIONS

To ensure that your PR is of high quality and to maintain the coding standards there are some best practices which we need to adhere to in order to successfully merge the PRs.

1. While committing the changes please ensure you sign your commits by using -s flag
```
  git commit -s -m “<YOUR COMMIT MESSAGE>”
```

2. Please fill in the details of the changes that have been made/modified with the respective PR and also check of the necessary checklist in the PR checklist itself.

3. Always lint your project locally before sending a PR.
```
  yarn run format
```

4. Don’t skip husky pre-commit checks as it ensures your code is well formatted and linted as well. Please don’t bypass husky since non-formatted code are very easy to detect.

5. Keep the main repository as an upstream in order to always fetch from the main repository and keep your local branch as updated as possible to not hinder your work.