import axios from 'axios';

export const sendGetRequest = (url) => {
  console.log("url inside sendRequest is", url);
  return axios({
    method: 'GET',
    url,
    headers: {
      Accept: 'application/vnd.github.v3+json'
    },
    // auth: {
    //   username: process.env.REACT_APP_GITHUB_USERNAME,
    //   password: process.env.REACT_APP_GITHUB_PAT
    // }
  })
  .then((response) => {
    console.log("response inside sendRequest is", response.data);
    return response.data;
  })
  .catch((error) => {
    console.log("Error inside sendRequest is", error);
  })
}