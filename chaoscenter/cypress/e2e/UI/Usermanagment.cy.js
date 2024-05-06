describe('testing for User management', () => {
    let user;
    before(() => {
        cy.fixture("Users").then((User) => {
            user = User.user2;
        });
    });

    beforeEach(() => {
        cy.login(Cypress.env('username'),Cypress.env('password'));       
    });

    it('Create User', () => {
        cy.get('.chaos_MainNav-module_navItem_MxEeXl').eq(1).click();
        cy.contains('User Management').click();
        cy.contains('New User').click();
        cy.get('input[name="name"]').type(user.name);
        cy.get('input[name="email"]').type(user.email);
        cy.get('input[name="username"]').type(user.username);
        cy.get('input[name="password"]').type(user.password);
        cy.get('input[name="reEnterPassword"]').type(user.password);
        cy.intercept('POST','/auth/create_user').as('user');
        cy.get('button[aria-label="Confirm"]').click();
        cy.wait('@user');
    });

    it('Edit User', () => {
        cy.get('.chaos_MainNav-module_navItem_MxEeXl').eq(1).click();
        cy.contains('User Management').click();
        cy.get('.bp3-popover-wrapper .bp3-button').then((buttons) => {
            cy.wrap(buttons[buttons.length - 1]).click();
        });
        cy.contains('Reset Password').click();
        cy.get('input[name="password"]').type('22222');
        cy.get('input[name="reEnterPassword"]').type('22222');
        cy.intercept('POST','/auth/reset/password').as('reset');
        cy.contains('Confirm').click();
        cy.wait('@reset');
    });

    it('Disable User', () => {
        cy.get('.chaos_MainNav-module_navItem_MxEeXl').eq(1).click();
        cy.contains('User Management').click();
        cy.get('.bp3-popover-wrapper .bp3-button').then((buttons) => {
            cy.wrap(buttons[buttons.length - 1]).click();
        });
        cy.contains('Disable User').click();
        cy.contains('Confirm').click();
    });
});