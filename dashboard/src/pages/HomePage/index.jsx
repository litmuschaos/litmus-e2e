import React from 'react';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import CustomCard from 'components/CustomCard';
import { getLocalStorage } from 'shared/storageHelper';
import Center from 'containers/layouts/Center';
import useStyles from './styles';

const HomePage = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const scheduledData = getLocalStorage("scheduledRuns");
  const manualData = getLocalStorage("manualRuns");
  return (
    <>
      <Center>
        <Typography variant="h3" className={classes.userName}>
          {t('home.heading')}
        </Typography>
      </Center>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between"}}>
        {scheduledData && scheduledData.map((scheduleItem) => <CustomCard data={scheduleItem} key={scheduleItem.id} category="scheduled-runs" />)}
        {manualData && manualData.map((manualItem) => <CustomCard data={manualItem} key={manualItem.id} category="manual-runs" />)}
      </div>

    </>
  );
};

export default HomePage;
