# GUI Test Cases For Auth in Litmus-Portal

<b>tcid:</b> GUI-Auth <br>
<b>name:</b> Auth Test Cases Using Browser<br>

### Prerequisites

     • Litmus-Portal should be installed on Cluster.
     • Cypress should be installed and running on Runner-Machine.

### Test Case 1:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify Litmus-Portal Login Page reachability.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Open Litmus-Portal URL in Browser
- Once the UI is accessible, check the URL and Content of the Login page.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Litmus_Portal Reachability successful.

### Test Case 2:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify Administrator Login.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Open Litmus-Portal URL in Browser
- Once the UI is accessible, log in with correct Administrator Credentials.
- Verify URL and Content of HomePage.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Administrator Login successful

### Test Case 3:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify Administrator Login with wrong username.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Open Litmus-Portal URL in Browser
- Once UI is accessible, log in with the wrong username
- Verify error message "Wrong Credentials - Try again with correct username or password".

#### &nbsp;&nbsp;&nbsp;Expected Output

    The user should be prompted with a correct Error message.

### Test Case 4:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify Administrator Login with the wrong password.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Open Litmus-Portal URL in Browser
- Once the UI is accessible, log in with the wrong password.
- Verify error message "Wrong Credentials - Try again with correct username or password".

#### &nbsp;&nbsp;&nbsp;Expected Output

    The user should be prompted with a correct Error message.
