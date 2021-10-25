import formatDistanceStrict from "date-fns/formatDistanceStrict";

export const readableNameConverter = (name) => name?.replace(/-/g, " ");

export const timeDifference = (startTime, endTime) =>
  formatDistanceStrict(new Date(startTime), new Date(endTime));

export const getTotalPipelineTime = (pipelines) => {
  let totalTime = 0;
  pipelines.forEach((pipeline) => {
    totalTime +=
      new Date(pipeline?.completed_at).getTime() -
      new Date(pipeline?.started_at).getTime();
  });
  const now = new Date();
  return timeDifference(now, new Date(now.getTime() + totalTime));
};
