describe('testing chaosinfra via UI', () => {
    beforeEach(() => {
        cy.login(Cypress.env('username'),Cypress.env('password'));       
    });

    it('Creating chaosinfra', () => {
        //create Environment
        cy.contains('Environments').click();
        cy.contains('New Environment').click();
        cy.get('input[name="name"]').type('exp1');
        cy.contains('Save').click();
        
        //create chaosinfra
        cy.get('.TableV2--row').eq(0).click();
        cy.contains('Enable Chaos').click();
        cy.get('.bp3-form-content').type('exp1');
        cy.contains('Next').click();
        cy.contains('Next').click();
        cy.contains('Download').click();
        cy.on('window alert', () => {
            expect(message).to.equal('Chaos infrastructure successfully created');
        });
        cy.contains('Done').click();   
    });

    it('negative test case for environment [Get error when creating environment with same name]', () => {
        cy.contains('Environments').click();
        cy.contains('New Environment').click();
        cy.get('input[name="name"]').type('exp1');
        cy.contains('Save').click();
        cy.on('alert message', () => {
            expect(message).to.equal('write exception: write errors: [E11000 duplicate key error collection: litmus.environment index: environment_id_1 dup key: { environment_id: "exp1" }]');
        });
    });

    it('Editing chaosinfra', () => {
        cy.contains('Environments').click();
        cy.get('.TableV2--row').eq(0).click();
        cy.contains('Update').eq(0).click();
        cy.get('button[aria-label= "Download"]').click();
        cy.on('window alert', () => {
            expect(message).to.equal('Download request successfully sent');
        });
        cy.contains('Done').click();
        cy.on('window alert', () => {
            expect(message).to.equal('Upgrade manifest downloaded successfully');
        });
    });

    it('Disable chaosinfra', () => {
        cy.contains('Environments').click();
        cy.get('.TableV2--row').eq(0).click();
        cy.get('.Card--dots').eq(0).click();
        cy.contains('Disable').click();
        cy.contains('Confirm').click();
        cy.on('window alert', () => {
            expect(message).to.equal('Chaos Infrastructure Successfully Disabled');
        });
    });
});