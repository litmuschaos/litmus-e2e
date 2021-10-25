import { createBrowserHistory } from "history"; // eslint-disable-line import/no-extraneous-dependencies

const history = createBrowserHistory({
  basename: process.env.PUBLIC_URL || "/litmus-e2e/dashboard",
});

export default history;
