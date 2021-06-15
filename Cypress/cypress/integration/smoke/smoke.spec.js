/**
 * This is the main smoke test file
 * It will go through the sub smoke tests written in smoke.js
 */

import { loginSmokeTest, workflowSmokeTest } from './smoke';

it('Smoke Test Login Page', () => {
    loginSmokeTest();
})

it('Smoke Test Workflow Scheduling', () => {
    workflowSmokeTest();
})