# GUI Test Cases For User-Management in Litmus-Portal

<b>tcid:</b> GUI-User-Management <br>
<b>name:</b> User-Management Test Cases Using Browser<br>

### Prerequisites

     • Litmus-Portal should be installed on Cluster.
     • Cypress should be installed and running on Runner-Machine.

#### Conditions:

- Username & password are the required fields.

### Test Case 1:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify creation of user by inputting username and password only.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as Admin.
- Goto the user-management Tab from settings options in Sidebar.
- Create a new user by inputting username and password only.
- Verify the same in the users table.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Create Button should be enabled & New users should be created.

### Test Case 2:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify creation of user by inputting full name and email only.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on the Usermanagement tab).
- Try creating a user by inputting full name and email only.

#### &nbsp;&nbsp;&nbsp;Expected Output

    The Create Button should be disabled.

### Test Case 3:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to create user by leaving full name empty

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on Usermanagement tab)
- Try creating a user by leaving the full name empty.
- Verify the same in the users table.

#### &nbsp;&nbsp;&nbsp;Expected Output

    The Create Button should be enabled & the user should be created.

### Test Case 4:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to create a user by leaving email empty

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on Usermanagement tab)
- Try creating user by leaving email empty
- Verify the same in the users table.

#### &nbsp;&nbsp;&nbsp;Expected Output

    The Create Button should be enabled & the user should be created.

### Test Case 5:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to create a user by inputting full name, email and password.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on Usermanagement tab)
- Try to create a user by inputting full name, email and password. ( Username is empty )

#### &nbsp;&nbsp;&nbsp;Expected Output

    The Create Button should be disabled.

### Test Case 6:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to create a user by inputting full name, email and username. ( Password is empty )

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on Usermanagement tab)
- Try to create a user by inputting full name, email and username.

#### &nbsp;&nbsp;&nbsp;Expected Output

    The Create Button should be disabled.

### Test Case 7:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify creation of user by inputting details of an existing user.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on Usermanagement tab)
- Create a new user by inputting details of an existing user.
- Verify the same in the users table.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Error modal should be shown with error "Error: This username is already assigned to another user"

### Test Case 8:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to create a user by inputting all details.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- (Already on Usermanagement tab)
- Try to create a user by inputting all details.
- Verify the same in the users table.

#### &nbsp;&nbsp;&nbsp;Expected Output

    The Create Button should be enabled and we should be able to create a user.
    Login with new user creds should be successful.
