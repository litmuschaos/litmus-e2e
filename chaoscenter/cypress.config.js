const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://192.168.49.2:31190',
    requestTimeout: 40000,
  },
  env: {
    username: 'admin',
    password: 'litmus'
  },
});
