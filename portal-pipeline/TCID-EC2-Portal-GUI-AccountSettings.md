# GUI Test Cases For My Account Settings in Litmus-Portal

<b>tcid:</b> GUI-Auth <br>
<b>name:</b> My Account Settings Test Cases Using Browser<br>

### Prerequisites

    • Litmus-Portal should be installed on Cluster.
    • Cypress should be installed and running on the Runner machine.

#### User Details Conditions:

- Username should not be editable & disabled.
- Email can be empty, otherwise verification should be done using regex.
- Passwords cannot be empty.

### Test Case 1:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to check the accessibility of Account Settings Tab.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as Administrator.
- Goto the Settings page by clicking on the Settings option from the Sidebar.
- Verify the Account Settings tab.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Users should be able to visit Settings Tab.

### Test Case 2:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify personal details editing by inputting all correct details (Positive Testcase).

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on Settings Page
- Verify all Admin details on Account Settings Tab (Username should be admin).
- Change the personal details by inputting all correct details (Full name & email) & verify from inputFields or API.
- Check the contents of the header with respect to new details.

#### &nbsp;&nbsp;&nbsp;Expected Output

    The user should be shown correct details & able to update the details.

### Test Case 3:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify personal details editing by inputting empty email (Negative test cases).

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on Settings Page)
- Change the email by inputting empty string/ wrong emails in syntax.
- For empty strings, email should be changed,
- For wrong emails, the save button should be disabled & input field should show the error.
- After changing, Check contents of the header with respect to new details.

#### &nbsp;&nbsp;&nbsp;Expected Output

    The user should be able to update with an empty string but other negative cases should show error & details should be changed.

### Test Case 4:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify personal details editing by inputting empty Fullname (Negative test cases).

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on Settings page)
- Change the full name with empty string & other edge cases.
- Full name should be changed only with empty string, in other cases the save button should be disabled.
- Check the contents of the header with respect to new details.

#### &nbsp;&nbsp;&nbsp;Expected Output

    The user should be able to update with an empty string but other negative cases should show error & details should be changed.

### Test Case 5:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify Change Password functionality with the password provided same as the current password.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on Settings page)
- Try changing the password by giving a new password the same as the old password.

#### &nbsp;&nbsp;&nbsp;Expected Output

    The user should be prompted with the Correct Error message and the change password button should be disabled.

### Test Case 6:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify Change Password functionality with the wrong current password.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on Settings page)
- Try changing the password by giving the wrong current password.

#### &nbsp;&nbsp;&nbsp;Expected Output

    The user should be prompted with the Correct Error message "Error: User authentication failed".

### Test Case 7:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify Change Password functionality with wrong confirmation password.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on Settings page)
- Try changing the password by giving the wrong confirmation password.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Change password button should be disabled.

### Test Case 8:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify Change Password functionality with new password as empty password.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on Settings page)
- Change password with new password as empty string.
- Error modal should be shown.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Error Modal should be shown & password should not be changed.

### Test Case 9:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify Change Password functionality with correct credentials.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on Settings page)
- Change password with correct details.
- Try logging in with a new password.
- Once verified, reset the password to the default one.

#### &nbsp;&nbsp;&nbsp;Expected Output

    change password should be verified and password should be reset.
