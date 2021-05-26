# Contributing to Litmus E2E

Welcome to Litmus!! This guide goes over in details about the contribution process to the litmus e2e.

Litmus is an Apache 2.0 Licensed project and uses the standard GitHub pull requests process to review and accept contributions. We welcome improvements from all contributors, new and experienced.

Litmus E2E contributors:

* Improve existing e2e test
* Add new tests to increase stability.
* Maintain e2e framework
* Keep e2e builds healthy
* Manage E2E [website](https://litmuschaos.github.io/litmus-e2e) with the converage.

Contributions are not limited to the above mentioned items. In case you have ideas for improving the E2E - Please create a PR.


## Steps to Contribute

The Litmus E2E uses [GitLab](https://litmuschaos.github.io/litmus-e2e/) pipelines to test litmus,it is broadly divided in three categories Generic, OpenEBS. LitmusPortal managed by respective branch in litmus-e2e repository. The main aim of litmus-e2e is to maintain the stability and higher performance of different litmus components.


* Find an issue to work on or create a new issue. The issues are maintained at [litmuschaos/litmus](https://github.com/litmuschaos/litmus/issues). For new contributors, you can pick up from a list of [good first issues](https://github.com/litmuschaos/litmus/issues?q=is%3Aissue+is%3Aopen+label%3Aarea%2Flitmus-docs+label%3A%22good+first+issue%22+)
* You can also pick a test to add from [master-plan.yml](https://github.com/litmuschaos/litmus-e2e/blob/master/.master-plan.yml) with label `test/status: "Not Done"` or propose a new test in master-plan.yml
* Claim your issue by commenting your intent to work on it to avoid duplication of efforts.
* Fork the repository on GitHub.
* Create a branch from where you want to base your work (usually master).
* Make your changes, test locally.
* Commit your changes by making sure the commit messages convey the need and notes about the commit.
* Push your changes to the branch in your fork of the repository.
* Submit a pull request to the original repository.

### Add a test in E2E Pipeline

If you're writing a _new test_ and your test is ready to be added then follow these steps to add it in e2e pipeline which runs on a VM ware machine using GitLab:

* Add go test command (`go test <test-name>_test.go -v -count=1`) as an arg of sshpass in the Makefile.
* Add a new entry of the test in `.gitlab-ci.yml` (use `make <command>` created above) with a proper stage and job name.
* If any new variable is used then don't forget the export it in [makefile](https://github.com/litmuschaos/litmus-e2e/blob/71601229b5522cde0f38b507aaa0657259dbf2dc/Makefile#L7).


A sample PR flow is outlined [here](https://guides.github.com/introduction/flow/). More detailed one is [here](https://gist.github.com/Chaser324/ce0505fbed06b947d962).

### Sign your work

We use the Developer Certificate of Origin (DCO) as an additional safeguard for the LitmusChaos project. This is a well established and widely used mechanism to assure that contributors have confirmed their right to license their contribution under the project's license. Please add a line to every git commit message:

```
  Signed-off-by: Random J Developer <random@developer.example.org>
```

The email id should match the email id provided in your GitHub profile. 

If you set your `user.name` and `user.email` in git config, you can sign your commit automatically with `git commit -s`. 

You can also use git [aliases](https://git-scm.com/book/tr/v2/Git-Basics-Git-Aliases) like `git config --global alias.ci 'commit -s'`. Now you can commit with `git ci` and the commit will be signed.

## Community

We organize the Litmus into Special Interest Groups or SIGs in order to improve our workflow and to easily manage this community project. The developers within each SIG have autonomy and ownership over that SIG’s part of Litmus.

Like everything else in Litmus, a SIG is an open, community, effort. We thrive on a lively and friendly open-source community. Anybody is welcome to jump into a SIG and begin writing or fixing tests, critiquing design proposals and reviewing code.

SIG-Testing is [here](https://github.com/litmuschaos/litmus/wiki/Special-Interest-Groups#sig-testing)!
