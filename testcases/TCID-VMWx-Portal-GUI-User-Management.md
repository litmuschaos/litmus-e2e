# GUI Test Cases For User-Management in Litmus-Portal

<b>tcid:</b> GUI-User-Management <br>
<b>name:</b> Local User-Management Testcases Using Browser<br>

### Prerequisites

    • Litmus-Portal should be installed on Cluster.
    • Cypress should be installed and running on Gitlab-Runner.

### Test Case 1:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to verify creation of user by inputting username and password only.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as Admin, Goto the user-managements page.
- Try creating a user by inputting username and password only.

#### &nbsp;&nbsp;&nbsp;Expected Output

     Create Button should be enabled.

### Test Case 2:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to verify creation of user by inputting fullname and email only.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as Admin, Goto the user-managements page.
- Try creating a user by inputting fullname and email only.

#### &nbsp;&nbsp;&nbsp;Expected Output

     Create Button should be disabled.

### Test Case 3:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to create user by leaving full name empty

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as Admin, Goto the user-managements page.
- Try creating user by leaving full name empty.

#### &nbsp;&nbsp;&nbsp;Expected Output

     Create Button should be enabled.

### Test Case 4:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to create a user by leaving email empty

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as Admin, Goto the user-managements page.
- Try creating user by leaving email empty

#### &nbsp;&nbsp;&nbsp;Expected Output

     Create Button should be enabled.

### Test Case 5:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to create a user by inputting full name, email and password.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as Admin, Goto the user-managements page.
- Try to create a user by inputting full name, email and password.

#### &nbsp;&nbsp;&nbsp;Expected Output

     Create Button should be disabled.

### Test Case 6:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to create a user by inputting full name, email and username.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as Admin, Goto the user-managements page.
- Try to create a user by inputting full name, email and username.

#### &nbsp;&nbsp;&nbsp;Expected Output

     Create Button should be disabled.

### Test Case 7:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to create a user by inputting all details.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Login as Admin, Goto the user-managements page.
- Try to create a user by inputting all details.

#### &nbsp;&nbsp;&nbsp;Expected Output

     Create Button should be enabled and we should be able to create user.
     Login with new user creds should be successful.
