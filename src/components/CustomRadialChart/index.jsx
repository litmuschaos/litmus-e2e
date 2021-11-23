import React from "react";
import { useTranslation } from "react-i18next";
import { RadialChart } from "litmus-ui";
import useStyles, { CustomTooltip } from "./styles";

const CustomRadialChart = ({
  pass = 0,
  fail = 0,
  pending = 0,
  size = "small",
  heading,
  drawer = false,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const setClassName = () => {
    if (drawer) {
      if (size === "small") {
        return classes.smallRadialChartDrawer;
      }
      return classes.largeRadialChartDrawer;
    }
    if (size === "small") {
      return classes.smallRadialChart;
    }
    return classes.largeRadialChart;
  };
  return (
    <CustomTooltip
      title={
        <p>
          {t("radialChart.pass")}: {pass}
          <br />
          {t("radialChart.fail")}: {fail}
          <br />
          {t("radialChart.pending")}: {pending}
        </p>
      }
      placement="right"
      arrow
    >
      <div className={setClassName()}>
        <RadialChart
          showCenterHeading={!!heading}
          heading={heading}
          arcWidth={4}
          showLegend={false}
          circleExpandOnHover={3}
          radialData={[
            {
              baseColor: "#00CC9A",
              label: "Pass",
              value: pass,
            },
            {
              baseColor: "#5252F6",
              label: "Pending",
              value: pending,
            },
            {
              baseColor: "#CA2C2C",
              label: "Failed",
              value: fail,
            },
          ]}
        />
      </div>
    </CustomTooltip>
  );
};

export default CustomRadialChart;
