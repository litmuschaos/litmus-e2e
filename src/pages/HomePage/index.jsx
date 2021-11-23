import React, { useState, useEffect } from "react";
import CustomCard from "components/CustomCard";
import Loader from "components/Loader";
import useStyles from "./styles";

const HomePage = ({ location, pipelineData }) => {
  const [pipelines, setPipelines] = useState(pipelineData);
  const [pipelinesToDisplay, setPipelinesToDisplay] = useState({
    manual: location?.state?.pipelinesToDisplay?.manual ?? true,
    nightly: location?.state?.pipelinesToDisplay?.nightly ?? true,
  });
  const classes = useStyles();
  useEffect(() => {
    setPipelines(pipelineData);
  }, [pipelineData]);
  useEffect(() => {
    setPipelinesToDisplay({
      manual: location?.state?.pipelinesToDisplay?.manual ?? true,
      nightly: location?.state?.pipelinesToDisplay?.nightly ?? true,
    });
  }, [JSON.stringify(location?.state?.pipelinesToDisplay)]);
  return (
    <>
      {(!pipelines?.all || !pipelines?.nightly || !pipelines?.manual) && (
        <Loader />
      )}
      <div className={classes.flex}>
        {pipelinesToDisplay?.nightly &&
          pipelinesToDisplay?.manual &&
          pipelines?.all && (
            <CustomCard
              data={pipelines?.all}
              key="all"
              url="/all"
              displayBadge={false}
            />
          )}
        {pipelinesToDisplay.nightly &&
          pipelines?.nightly &&
          pipelines?.nightly?.map((pipeline) => (
            <CustomCard data={pipeline} key={pipeline?.id} displayBadge />
          ))}
        {pipelinesToDisplay.manual &&
          pipelines?.manual &&
          pipelines?.manual?.map((pipeline) => (
            <CustomCard data={pipeline} key={pipeline?.id} displayBadge />
          ))}
      </div>
    </>
  );
};

export default HomePage;
