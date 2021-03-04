# GUI Test Cases For Teaming in Litmus-Portal

<b>tcid:</b> GUI-Teaming <br>
<b>name:</b> Teaming Tests Using Browser<br>

### Prerequisites

    • Litmus-Portal should be installed on Cluster.
    • Cypress should be installed and running on Gitlab-Runner.

### Test Case 1:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to check the accessibility of Team Tab.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as Admin and goto Team Tab in Settings page.
- Check if Team Tab is visible on page.

#### &nbsp;&nbsp;&nbsp;Expected Output

     Users should be able to see Team Tab.

### Test Case 2:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to check the functionality of Invite Tab.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as Admin and goto User-management tab.
- Create a User with sample Creds.
- Goto the Team Tab and click on Invite a member.
- Login with new user creds and create a project.
- Logout and Login again as admin and check the Invite tab.

#### &nbsp;&nbsp;&nbsp;Expected Output

     Users should be able to see the newly created user in the invite tab.

### Test Case 3:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to check the Invitation Functionality.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as Admin and goto Teaming Tab.
- Click on "Invite a member" and select the newly created user and click on "send invite" as a viewer.
- Check the Sent tab and Login with the new user and check the invitation received.
- Accept the invitation and check if it is visible in active projects.

#### &nbsp;&nbsp;&nbsp;Expected Output

     Users should be able to see the newly created user in the invite tab.
