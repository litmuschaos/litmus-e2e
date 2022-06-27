/**
 * This is the main smoke test file
 * It will go through the sub smoke tests written in smoke.js
 */

import {
  customWorkflowSmokeTest,
  loginSmokeTest,
  preDefinedWorkflowSmokeTest,
  templateWorkflowSmokeTest,
  uploadWorkflowSmokeTest,
  setup,
} from "./smoke";

it("Smoke Test Login Page", () => {
  loginSmokeTest();
});

describe("Smoke Test Workflow V2", () => {
  // Checks if cluster is present or not
  it("Checks for Agent in the Portal", () => {
    setup({
      doWaitForCluster: true,
    });
  });

  // Schedules a Predefined Workflow
  it("Predefined Workflow Scheduling", () => {
    preDefinedWorkflowSmokeTest();
  });

  // Schedules a Custom Workflow from Template
  it("Template Workflow Scheduling", () => {
    templateWorkflowSmokeTest();
  });

  // Schedules a Custom Workflow
  it("Custom Workflow Scheduling", () => {
    customWorkflowSmokeTest();
  });

  // Upload and Schedules a Custom Workflow
  it("Uploaded Workflow Scheduling", () => {
    uploadWorkflowSmokeTest();
  });
});
