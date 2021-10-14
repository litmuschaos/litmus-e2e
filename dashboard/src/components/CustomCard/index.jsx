import React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import PlayCircleFilled from "@material-ui/icons/PlayCircleFilled";
import GitHub from "@material-ui/icons/GitHub";
import { Link } from "react-router-dom";

const useStyles = makeStyles({
  root: {
    padding: "1rem 2rem",
    margin: "1rem 0",
    flex: "0 0 30%",
  },
  title: {
    fontSize: 14,
    color: "#0000008a",
  },
  pos: {
    marginBottom: 12,
    color: "#0000008a",
  },
});

const CustomCard = ({ data, category }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Card className={classes.root} variant="outlined">
      <CardContent>
        <Typography className={classes.title} gutterBottom>
          <PlayCircleFilled style={{ marginBottom: "-0.3rem" }} />
          {data?.readableName}
        </Typography>
        <img src={data?.badge_url} alt="status of pipeline" />
      </CardContent>
      <CardActions>
        <Link
          to={{
            pathname: `/${category}`,
            state: { id: data?.id, readableName: data?.readableName },
          }}
        >
          <Button size="small">{t("card.pipelineDetails")}</Button>
        </Link>
        <a
          href={data.html_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "black", marginLeft: "auto" }}
        >
          <GitHub />
        </a>
      </CardActions>
    </Card>
  );
};

export default CustomCard;
