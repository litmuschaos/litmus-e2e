describe('testing UserManagement', () => {
    before(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    });

    it('tesing through REST APIs', () => {
        const accessToken = localStorage.getItem('accessToken');

        //add user
        const add_payload = {
            name: 'user10',
            email: 'user10@gmail.com',
            username: 'user10',
            password: 'user10',
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
            expect(response.body.username).to.eq(payload.username);
            expect(response.body.email).to.eq(payload.email);
            expect(response.body.name).to.eq(payload.name);
        });

        //edit password
        const edit_payload = {
            username: 'user10',
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

        //disable user
        const disable_payload = {
            username: 'user10',
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
    })

    it('testing through UI', () => {
        cy.login(Cypress.env('username'),Cypress.env('password'));

        cy.get('.chaos_MainNav-module_navItem_MxEeXl').eq(1).click();
        cy.contains('User Management').click();

        //create user
        cy.contains('New User').click();
        cy.get('input[name="name"]').type('User22222');
        cy.get('input[name="email"]').type('User22222@gmail.com');
        cy.get('input[name="username"]').type('User22222');
        cy.get('input[name="password"]').type('User22222');
        cy.get('input[name="reEnterPassword"]').type('User22222');
        cy.intercept('POST','/auth/create_user').as('user');
        cy.get('button[aria-label="Confirm"]').click();
        cy.wait('@user');

        //edit user
        cy.get('.bp3-popover-wrapper .bp3-button').then((buttons) => {
            cy.wrap(buttons[buttons.length - 1]).click();
        });
        cy.contains('Reset Password').click();
        cy.get('input[name="password"]').type('22222');
        cy.get('input[name="reEnterPassword"]').type('22222');
        cy.intercept('POST','/auth/reset/password').as('reset');
        cy.contains('Confirm').click();
        cy.wait('@reset');

        //disable User
        cy.get('.bp3-popover-target').then((buttons) => {
            cy.wrap(buttons[buttons.length - 1]).click();
        });
        cy.contains('Disable User').click();
        cy.contains('Confirm').click();
    })
});