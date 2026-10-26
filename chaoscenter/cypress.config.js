const { defineConfig } = require("cypress");

module.exports = defineConfig({
  // one JUnit file per spec, collected by the nightly report
  reporter: "junit",
  reporterOptions: {
    mochaFile: "results/chaoscenter-[hash].xml",
    toConsole: false,
  },
  video: false,
  e2e: {
    baseUrl: process.env.CYPRESS_baseUrl || "http://localhost:3000", // default value
    requestTimeout: 60000,
    responseTimeout: 60000
  },
  env: {
    username: 'admin',
    password: 'litmus'
  },
});
