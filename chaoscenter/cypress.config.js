const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://192.168.49.2:30829',
    requestTimeout: 60000,
    responseTimeout: 60000
  },
  env: {
    username: 'admin',
    password: 'litmus'
  },
});
