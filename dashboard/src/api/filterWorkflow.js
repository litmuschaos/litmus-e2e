import { readableNameConverter } from "shared/helper";

const filterWorkflow = (responseData) => {
  if (responseData) {
    const nightlyData = [];
    const manualData = [];
    responseData.workflows.forEach((element) => {
      if (element.name.match(/^Nightly.*Pipeline$/) != null) {
        nightlyData.push({
          ...element,
          readableName: readableNameConverter(element.name),
        });
      } else if (element.name.match(/.*Pipeline$/) != null) {
        manualData.push({
          ...element,
          readableName: readableNameConverter(element.name),
        });
      }
    });
    return {
      nightly: nightlyData,
      manual: manualData,
    };
  }
  return {
    nightly: null,
    manual: null,
  };
};

export default filterWorkflow;
