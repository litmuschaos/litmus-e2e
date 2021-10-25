export const conclusionMap = {
  action_required: "pending",
  cancelled: "fail",
  failure: "fail",
  neutral: "pass",
  skipped: "pass",
  stale: "pass",
  startup_failure: "fail",
  success: "pass",
  timed_out: "fail",
};

export const jobStepResult = (jobSteps) => {
  const result = {
    pending: 0,
    pass: 0,
    fail: 0,
  };
  if (jobSteps && Array.isArray(jobSteps)) {
    jobSteps.forEach((step) => {
      if (step?.status !== "completed") {
        ++result.pending;
      } else {
        ++result[conclusionMap[step?.conclusion]];
      }
    });
  }

  return result;
};

export const descriptionMapping = {
  "Component Pipeline":
    "It contains the test cases (GO BDDs) for component-level generic experiments",
  "Pod Level Pipeline":
    "It contains the test cases (GO BDDs) for all pod-level generic experiments",
  "Node Level Pipeline":
    "It contains the test cases (GO BDDs) for node-level generic experiments",
  "AWS Experiment Pipeline":
    "It contains the test cases (GO BDDs) for all AWS experiments",
  "Portal E2E K3S Pipeline":
    "It contains different UI E2E test cases for litmus portal",
  "GCP Experiment Pipeline":
    "It contains the test cases (GO BDDs) for all GCP experiments",
  "Nightly Component Pipeline":
    "It contains the test cases (GO BDDs) for component-level generic experiments",
  "Nightly Pod Level Pipeline":
    "It contains the test cases (GO BDDs) for all pod-level generic experiments",
  "Nightly Node Level Pipeline":
    "It contains the test cases (GO BDDs) for node-level generic experiments",
  "Nightly AWS Experiment Pipeline":
    "It contains the test cases (GO BDDs) for all AWS experiments",
  "Nightly Portal E2E K3S Pipeline":
    "It contains different UI E2E test cases for litmus portal",
  "Nightly GCP Experiment Pipeline":
    "It contains the test cases (GO BDDs) for all GCP experiments",
};
