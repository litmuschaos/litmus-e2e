import axios from "axios";

const sendGetRequest = (url) =>
  axios({
    method: "GET",
    url,
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  })
    .then((response) => response.data)
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
    });

export default sendGetRequest;
