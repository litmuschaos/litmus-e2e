# GUI Test Cases For My Account Settings in Litmus-Portal

<b>tcid:</b> GUI-Auth <br>
<b>name:</b> My Account Settings Test Cases Using Browser<br>

### Prerequisites

    • Litmus-Portal should be installed on Cluster.
    • Cypress should be installed and running on Gitlab-Runner.

### Test Case 1:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to verify personal details editing by inputting all details.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as administrator.
- Go to the Settings page by clicking on the sidebar tab.
- Try changing the personal details by inputting all details.
- Check contents of header with respect to new details.

#### &nbsp;&nbsp;&nbsp;Expected Output

     The user should be able to update the details and the Header should show correct details.

### Test Case 2:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to verify personal details editing by inputting empty email.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as administrator.
- Go to the Settings page by clicking on the sidebar tab.
- Try changing the personal details by inputting empty email.
- Check contents of header with respect to new details.

#### &nbsp;&nbsp;&nbsp;Expected Output

     The user should be able to update the details and the Header should show correct details with empty email.

### Test Case 3:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to verify personal details editing by inputting empty Fullname.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as administrator.
- Go to the Settings page by clicking on the sidebar tab.
- Try changing the personal details by inputting empty Fullname.
- Check contents of header with respect to new details.

#### &nbsp;&nbsp;&nbsp;Expected Output

     The user should be able to update the details and the Header should show correct details with empty Fullname.

### Test Case 4:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to verify Change Password functionality with the password provided same as the current password.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as administrator.
- Go to the Settings page by clicking on the sidebar tab.
- Try changing the password by giving a new password the same as the old password.

#### &nbsp;&nbsp;&nbsp;Expected Output

     The user should be prompted with the Correct Error message and the change password button should be disabled.

### Test Case 5:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to verify Change Password functionality with the wrong current password.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as administrator.
- Go to the Settings page by clicking on the sidebar tab.
- Try changing the password by giving the wrong current password.

#### &nbsp;&nbsp;&nbsp;Expected Output

     The user should be prompted with the Correct Error message "Error: User authentication failed".

### Test Case 6:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to verify Change Password functionality with wrong confirmation password.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login administrator.
- Go to the Settings page by clicking on the sidebar tab.
- Try changing the password by giving the wrong confirmation password.

#### &nbsp;&nbsp;&nbsp;Expected Output

     Change password button should be disabled.

### Test Case 7:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to verify Change Password functionality with correct credentials.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login administrator.
- Go to the Settings page by clicking on the sidebar tab.
- Change password with correct details.
- Try logging in with a new password.
- Once verified, reset the password to the default one.

#### &nbsp;&nbsp;&nbsp;Expected Output

     change password should be verified and password should be reset.
