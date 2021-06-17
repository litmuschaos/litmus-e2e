/**
 * This is the main smoke test file
 * It will go through the sub smoke tests written in smoke.js
 */

import { customWorkflowSmokeTest, loginSmokeTest, preDefinedWorkflowSmokeTest, setup } from './smoke';

it('Smoke Test Login Page', () => {
    loginSmokeTest();
})

describe("Smoke Test Workflow V2", () => {
    
    // Logs in and Checks if cluster is present or not
    it("Setup the Portal", () => {
        setup({
            doWaitForCluster: true
        });
    })

    // Schedules a Predefined Workflow
    it('Predefined Workflow Scheduling', () => {
        preDefinedWorkflowSmokeTest();
    })

    // Schedules a Custom Workflow
    it('Custom Workflow Scheduling', () => {
        customWorkflowSmokeTest();
    })
})