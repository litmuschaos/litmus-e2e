describe('testing chaosinfra via UI', () => {
    beforeEach(() => {
        cy.login(Cypress.env('username'),Cypress.env('password'));       
    });

    it('Creating chaosinfra', () => {
        //create chaosinfra
        cy.contains('Environments').click();
        cy.get('.TableV2--row').eq(0).click();
        cy.contains('Enable Chaos').click();
        cy.get('.bp3-form-content').type('exp11');
        cy.interceptGraphQL('registerInfra', 'registerInfra');
        cy.contains('Next').click();
        cy.contains('Next').click();
        cy.expectGraphQLSuccess('registerInfra');
        cy.contains('Download').click();
        cy.contains('Done').click();   
    });

    it('negative test case for environment [Get error when creating environment with same name]', () => {
        cy.contains('Environments').click();
        cy.contains('New Environment').click();
        cy.get('input[name="name"]').type('exp99');
        cy.interceptGraphQL('createEnvironment', 'createEnvironment');
        cy.contains('Save').click();
        cy.expectGraphQLError('createEnvironment', 'write exception: write errors: [E11000 duplicate key error collection:');
    });

    it('Editing chaosinfra', () => {
        cy.contains('Environments').click();
        cy.get('.TableV2--row').eq(0).click();
        cy.contains('Update').first().click();
        cy.interceptGraphQL('getInfraManifest', 'getInfraManifest');
        cy.get('button[aria-label= "Download"]').click();
        cy.expectGraphQLSuccess('getInfraManifest');
        cy.contains('Done').click();
    });

    it('Disable chaosinfra', () => {
        cy.contains('Environments').click();
        cy.get('.TableV2--row').eq(0).click();
        cy.get('.Card--dots').eq(0).click();
        cy.contains('Disable').click();
        cy.interceptGraphQL('deleteInfra', 'deleteInfra');
        cy.contains('Confirm').click();
        cy.expectGraphQLSuccess('deleteInfra');
    });
});