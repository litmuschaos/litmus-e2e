import React from "react";
import { Button, Typography } from "@material-ui/core";
import history from "utils/history";
import useStyles from "./styles";

const ErrorPage = () => {
  const classes = useStyles();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  });
  return (
    <>
      <div className={classes.mainHeader}>
        <div className={classes.rootContainer}>
          <div className={classes.root}>
            <div className={classes.headerDiv}>
              <Typography className={classes.mainText}>
                <strong>
                  Whoops!
                  <br />
                  This page is unavailable
                </strong>
              </Typography>
              <Typography className={classes.descText}>
                The page does not exist, or please try again later.
              </Typography>
              <Button
                onClick={() => history.goBack()}
                className={classes.backBtn}
              >
                Go back
              </Button>
            </div>
            <div className={classes.imgDiv}>
              <img
                src="./icons/litmus-404.png"
                className={classes.errImg}
                alt="404"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ErrorPage;
