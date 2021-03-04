# GUI Test Cases For Routes Checks (With/Without Login) in Litmus-Portal

<b>tcid:</b> GUI-Routes <br>
<b>name:</b> Local Routes Testcases Using Browser<br>

### Prerequisites

    • Litmus-Portal should be installed on Cluster.
    • Cypress should be installed and running on Gitlab-Runner.

### Test Case 1:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to verify routes functionality without Login.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Open Litmus-Portal URL in Browser
- Once UI is accessible, Try visiting Different routes without logging In and check contents of landing page.

#### &nbsp;&nbsp;&nbsp;Expected Output

     User should be redirected to Login Page.

### Test Case 2:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to verify routes functionality after loggting In as Admin.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Open Litmus-Portal URL in Browser
- Once UI is accessible, log in with correct Administrator Credentials.
- Try Visiting different routes (Known Routes).

#### &nbsp;&nbsp;&nbsp;Expected Output

     User should be redirected to requested page.

### Test Case 3:

#### &nbsp;&nbsp;&nbsp;Details

     Test case to verify routes functionality after loggting In as Admin.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Open Litmus-Portal URL in Browser
- Once UI is accessible, log in with correct Administrator Credentials.
- Try Visiting different routes (Unknown Route).

#### &nbsp;&nbsp;&nbsp;Expected Output

     The user should be redirected to 404 Page.
