import React from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@material-ui/core";
import CustomCard from "components/CustomCard";
import { getLocalStorage } from "shared/storageHelper";
import Center from "containers/layouts/Center";
import useStyles from "./styles";

const HomePage = () => {
  const classes = useStyles();
  const nightlyData = getLocalStorage("nightlyRuns");
  const manualData = getLocalStorage("manualRuns");
  const { t } = useTranslation();
  return (
    <>
      <Center>
        <Typography variant="h3" className={classes.userName}>
          {t("homepage.description")}
        </Typography>
      </Center>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {nightlyData &&
          nightlyData.map((nightlyItem) => (
            <CustomCard
              data={nightlyItem}
              key={nightlyItem.id}
              category="nightly-runs"
            />
          ))}
        {manualData &&
          manualData.map((manualItem) => (
            <CustomCard
              data={manualItem}
              key={manualItem.id}
              category="manual-runs"
            />
          ))}
      </div>
    </>
  );
};

export default HomePage;
