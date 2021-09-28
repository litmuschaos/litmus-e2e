# GUI Test Cases For Routes Checks (With/Without Login) in Litmus-Portal

<b>tcid:</b> GUI-Routes <br>
<b>name:</b> Local Routes Test Cases Using Browser<br>

### Prerequisites

     • Litmus-Portal should be installed on Cluster.
     • Cypress should be installed and running on Runner-Machine.

### Test Case 1:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify routes functionality without Login.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Open Litmus-Portal URL in Browser
- Once the UI is accessible, Try visiting Different routes without logging In and check the contents of the landing page.

#### &nbsp;&nbsp;&nbsp;Expected Output

    Users should be redirected to the Login Page.

### Test Case 2:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify route functionality after logging In as Admin.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Open Litmus-Portal URL in Browser
- Once the UI is accessible, log in with correct Administrator Credentials.
- Try Visiting different routes (Known Routes).

#### &nbsp;&nbsp;&nbsp;Expected Output

    Users should be redirected to the requested page.

### Test Case 3:

#### &nbsp;&nbsp;&nbsp;Details

    Test case to verify route functionality after logging In as Admin.

#### &nbsp;&nbsp;&nbsp;Steps Performed in the test

- Open Litmus-Portal URL in Browser
- Once the UI is accessible, log in with correct Administrator Credentials.
- Try Visiting different routes (Unknown Route).

#### &nbsp;&nbsp;&nbsp;Expected Output

    The user should be redirected to 404 Page.
