/*
  Possible conclusion values are:
  action_required
  cancelled
  failure
  neutral
  skipped
  stale
  startup_failure
  success
  timed_out
*/ 
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
}

export const jobStepResult = (jobSteps) => {
  const result = {
    pending: 0,
    pass: 0,
    fail: 0,
  };
  console.log("jobsteps are", jobSteps);
  if(jobSteps && Array.isArray(jobSteps)) {
    jobSteps.forEach((step) => {
      if(step?.status !== "completed") {
        ++result.pending;
      }
      else {
        ++result[conclusionMap[step?.conclusion]];
      }
    });
  }

  return result;
}
