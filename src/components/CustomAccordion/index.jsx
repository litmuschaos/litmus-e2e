import React, { useState, useEffect } from "react";
import Loader from "components/Loader";
import { sendPostRequest } from "api/sendRequest";
import endpoints from "constants/endpoints";
import useStyles from "./styles";

const CustomAccordion = ({ pipelineId, jobName, stepNumber, children }) => {
  const [show, setShow] = useState(false);
  const [logs, setLogs] = useState(null);
  const classes = useStyles();
  useEffect(() => {
    if (show) {
      const payload = {
        pipelineId,
        jobName,
        stepNumber,
      };
      sendPostRequest(endpoints.logs(), payload)
        .then((data) => {
          setLogs(data);
        })
        .catch(() => {});
    }
  }, [show]);
  return (
    <>
      <button
        className={classes.button}
        onClick={() => setShow((prev) => !prev)}
        type="button"
      >
        {children}
        <span className={classes.control}>{show ? "—" : "+"} </span>
      </button>
      <div>
        {show &&
          (logs ? <pre className={classes.pre}>{logs}</pre> : <Loader />)}
      </div>
    </>
  );
};

export default CustomAccordion;
