/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */

const { rmdir } = require("fs");
const MongoClient = require("mongodb").MongoClient;

const MONGO_URL =
  "mongodb://admin:1234@" +
  (process.env.CYPRESS_MONGO_URL
    ? process.env.CYPRESS_MONGO_URL
    : "localhost:27017");

async function drop(databaseName, mongoClient, collectionName) {
  const collection = mongoClient.db(databaseName).collection(collectionName);
  await collection.drop().catch((e) => {
    if (e.code !== 26) {
      throw e;
    }
  });
}

async function clearDatabase() {
  const client = new MongoClient(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    const collection = client.db("auth").collection("users");
    await collection.deleteMany({ username: { $ne: "admin" } }).catch((e) => {
      if (e.code !== 26) {
        throw e;
      }
    });
    const auth = ["project"];
    const litmus = [
      "cluster-collection",
      "image-registry-collection",
      "myhub",
      "workflow-collection",
      "workflow-template",
      "gitops-collection",
      "image-registry-collection",
    ];
    for (const element of auth) {
      await drop("auth", client, element);
    }
    for (const element of litmus) {
      await drop("litmus", client, element);
    }
    client.close();
    return true;
  } catch (err) {
    console.log(err.stack);
    return false;
  }
}

async function waitUntilAgent(agentName) {
  const client = new MongoClient(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    const collection = client.db("litmus").collection("cluster-collection");
    return await new Promise((resolve) => {
      const interval = setInterval(() => {
        return collection
          .findOne({ cluster_name: agentName })
          .then((result) => {
            if (result.is_active) {
              client.close();
              resolve(true);
              clearInterval(interval);
            }
          });
      }, 2000);
    });
  } catch (err) {
    console.log(err.stack);
    client.close();
    return false;
  }
}

async function getAdminProject() {
  const client = new MongoClient(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    const collection = client.db("auth").collection("project");
    return await new Promise((resolve) => {
      return collection.findOne({}).then((result) => {
        client.close();
        resolve(result);
      });
    });
  } catch (err) {
    console.log(err.stack);
    return false;
  }
}

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on("task", {
    deleteFolder(folderName) {
      console.log("deleting folder %s", folderName);

      return new Promise((resolve, reject) => {
        rmdir(folderName, { maxRetries: 10, recursive: true }, (err) => {
          if (err) {
            console.error(err);
            return reject(err);
          }
          resolve(null);
        });
      });
    },
    clearDB: () => {
      return clearDatabase();
    },
    waitForAgent: (agentName) => {
      return waitUntilAgent(agentName);
    },
    getAdminProject: () => {
      return getAdminProject();
    },
  });
};
