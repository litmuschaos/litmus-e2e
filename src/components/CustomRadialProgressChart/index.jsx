import React from "react";
import { useTranslation } from "react-i18next";
import { RadialProgressChart } from "litmus-ui";
import PassedIcon from "svg/passed.svg";
import useStyles, { CustomTooltip } from "./styles";

const CustomRadialProgressChart = ({
  passPercentage = 0,
  heading,
  unit = "%",
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <CustomTooltip
      title={
        <p>
          {t("radialProgressChart.testCoverage")}: {passPercentage}
          {unit}
        </p>
      }
      placement="right"
      arrow
    >
      <div className={classes.largeRadialChart}>
        <RadialProgressChart
          imageSrc={PassedIcon}
          imageAlt="pass icon"
          heading={heading}
          unit={unit}
          arcWidth={4}
          radialData={{
            baseColor: "#00CC9A",
            label: "Pass",
            value: passPercentage,
          }}
        />
      </div>
    </CustomTooltip>
  );
};

export default CustomRadialProgressChart;
