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
