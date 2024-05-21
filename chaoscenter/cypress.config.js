const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000", // default value
    setupNodeEvents(on, config) {
      config.env.baseUrl = process.env.CYPRESS_baseUrl || config.env.baseUrl;
      return config;
    },
    requestTimeout: 60000,
    responseTimeout: 60000
  },
  env: {
    username: 'admin',
    password: 'litmus'
  },
});
