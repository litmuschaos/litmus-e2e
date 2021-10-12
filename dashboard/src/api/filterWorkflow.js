import { readableNameConverter } from "shared/helper";

export const filterWorkflow = (responseData) => {
  if(responseData) {
    const total_count = responseData.total_count;
    const scheduledData = [];
    const manualData = [];
    responseData.workflows.forEach((element) => {
      if (element.name.match(/^Scheduled.*Pipeline$/) != null) {
        scheduledData.push({
          ...element,
          readableName: readableNameConverter(element.name)
        })
      }
      else if (element.name.match(/.*Pipeline$/) != null){
        manualData.push({
          ...element,
          readableName: readableNameConverter(element.name)
        })
      }    
    });
    console.log("total_count is", total_count);
    console.log("scheduledData is", scheduledData);
    console.log("manualData is", manualData);
    return {
      scheduled: scheduledData,
      manual: manualData,
    }
  }
  else {
    return {
      scheduled: null,
      manual: null, 
    }
  }

}