# GUI Test Cases For Teaming in Litmus-Portal

<b>tcid:</b> GUI-Teaming <br>
<b>name:</b> Teaming Tests Using Browser<br>

### Prerequisites

     • Litmus-Portal should be installed on Cluster.
     • Cypress should be installed and running on Runner Machine.

### Test Case 1:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to check the accessibility of Team Tab.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as Admin and goto Team Tab in the Settings page.
- Check if Team Tab is visible on the page.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Users should be able to see Team Tab.

### Test Case 2:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to check the default Project Details of Teaming Tab.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on Teaming tab)
- Verify the project details
- Number of projects
- Invitations
- Project name
- Members in project (By default, Only admin should be the member)
- Invitation sent/Received (By default, should be zero)
- Invited tab (By default, no user should be invited)

#### &nbsp;&nbsp;&nbsp;Expected Output

    All project details should be verified.

### Test Case 3:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to check the Invitation Functionality (Invitations as a viewer).

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on Teaming tab)
- Goto the User-Management Tab, create a new user.
- Return to the Teaming Tab, Click on the "Invite a member" button and select the newly created user and click on "send invite" as a viewer.
- Verify the invitation in the Sent tab.
- Login with the new user, check the invitation received, Accept the invitation and check if it is visible in active projects.
- Verify the RBAC in frontend as Viewer in admin's project.
- Settings page should not be visible.
- Workflow scheduling should not be allowed.
- Agent connection or disconnection should not be allowed.
- Hub connection/ disconnection should not be allowed.
- Usage stats page should not be visible.
- Again login as admin, Check the status of invitation & verify members in the project.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Users should be able to invite a new member as a viewer to his/her project.

### Test Case 4:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to check the Invitation Functionality (Invitations as an Editor).

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on Teaming tab)
- Goto the User-Management Tab, create a new user.
- Return to the Teaming Tab, Click on the "Invite a member" button and select the newly created user and click on "send invite" as a viewer.
- Verify the invitation in the Sent tab.
- Login with the new user, check the invitation received, Accept the invitation and check if it is visible in active projects.
- Verify the RBAC in frontend as Editor in admin's project.
- Settings page should not be visible.
- Workflow scheduling should be allowed.
- Agent connection or disconnection should be allowed.
- Hub connection/ disconnection should be allowed.
- Usage stats page should not be visible.
- Again login as admin, Check the status of invitation & verify members in the project.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Users should be able to invite a new member as a viewer to his/her project.
