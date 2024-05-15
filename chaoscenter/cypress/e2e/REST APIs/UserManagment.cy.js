describe('Test Cases for User-Management', () => {
    let user;
    beforeEach(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
        cy.fixture("Users").then((User) => {
            user = User.user1;
        });
    });

    it('Create New User', () => {
        const accessToken = localStorage.getItem('accessToken');

        //add user
        const add_payload = {
            name: user.name,
            email: user.email,
            username: user.username,
            password: user.password,
            role: 'user'
          };

        cy.request({
        method: 'POST',
        url: '/auth/create_user', 
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        body: add_payload,
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.username).to.eq(add_payload.username);
            expect(response.body.email).to.eq(add_payload.email);
            expect(response.body.name).to.eq(add_payload.name);
        });
    });

    it('Negative test case for User management [Get error when creating User with same name]', () => {
        const accessToken = localStorage.getItem('accessToken');

        //add user
        const add_payload = {
            name: user.name,
            email: user.email,
            username: user.username,
            password: user.password,
            role: 'user'
          };

        cy.request({
        method: 'POST',
        url: '/auth/create_user', 
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        body: add_payload,
        failOnStatusCode: false,
        }).then((response) => {
            expect(response.body.error).to.equal('user_exists');
        });
    })

    it('Edit user password', () => {
        const accessToken = localStorage.getItem('accessToken');

        const edit_payload = {
            username: user.username,
            oldPassword: '',
            newPassword: '1'
          };

        cy.request({
        method: 'POST',
        url: '/auth/reset/password', 
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        body: edit_payload,
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.message).to.eq('password has been reset successfully');
        });
    });

    it('Disable user', () => {
        const accessToken = localStorage.getItem('accessToken');

        //negative test case for disable user
        const disable_payload1 = {
            username: '123',
            isDeactivate: true
          };
        
        cy.request({
        method: 'POST',
        url: '/auth/update/state', 
        failOnStatusCode: false,
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        body: disable_payload1,
        }).then((response) => {
            expect(response.body.error).to.equal('user does not exist');
        });


        //disable user
        const disable_payload = {
            username: user.username,
            isDeactivate: true
          };
        
        cy.request({
        method: 'POST',
        url: '/auth/update/state', 
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        body: disable_payload,
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.message).to.eq("user's state updated successfully");
        });
    });
});