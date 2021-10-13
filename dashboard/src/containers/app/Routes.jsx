import React, { lazy } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Scaffold from "containers/layouts/Scaffold";
import SuspenseLoader from "components/SuspenseLoader";

const ErrorPage = lazy(() => import("pages/ErrorPage"));
const HomePage = lazy(() => import("pages/HomePage"));
const NightlyRuns = lazy(() => import("pages/NightlyRuns"));
const ManualRuns = lazy(() => import("pages/ManualRuns"));

const Routes = () => (
  <Scaffold>
    <SuspenseLoader style={{ height: "80vh" }}>
      <Switch>
        <Route exact path="/" render={(props) => <HomePage {...props} />} />
        <Route
          exact
          path="/manual-runs"
          render={(props) => <ManualRuns {...props} />}
        />
        <Route
          exact
          path="/nightly-runs"
          render={(props) => <NightlyRuns {...props} />}
        />
        <Route exact path="/404" component={ErrorPage} />
        <Redirect to="/404" />
      </Switch>
    </SuspenseLoader>
  </Scaffold>
);

export default Routes;
