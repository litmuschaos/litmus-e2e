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
    // ChaosCenter asks for a new password at the first login and rejects the calls until it is set.
    // The suite changes the initial password to `password` once, see ensureAdminPassword.
    initialPassword: 'litmus',
    password: 'Litmus@2026e2e'
  },
});
