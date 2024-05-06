describe('testing chaoshub via UI', () => {
    beforeEach(() => {
        cy.login(Cypress.env('username'),Cypress.env('password'));       
    });

    it('Create new ChaosHub', () => {
        cy.visit('/dashboard');
        cy.contains('ChaosHubs').click();
        cy.contains('Litmus ChaosHub').should('exist');
        cy.contains('Connected').should('exist');
    
        //Add new chaoshub with public repo
        cy.contains('New ChaosHub').click();
        cy.get('input[name="name"]').type('testing1');
        cy.contains('Continue').click();
        cy.get('input[name="repoURL"]').type('https://github.com/litmuschaos/chaos-charts.git');
        cy.get('input[name="repoBranch"]').type('master');
        cy.intercept('POST','/api/query').as('Query');
        cy.get('button[aria-label = "Connect Hub"]').click();
        cy.wait('@Query');
        cy.on('window:alert', () => {
            expect(message).to.equal('Chaoshub added successfully');
        });
        
        //Checks if chaoshub is connected
        cy.get('[class="chaos_ChaosHubs-module_connectionStatus_PWHgAA"]').eq(1).contains('Connected').should('exist');
        cy.get('.bp3-card').eq(1).click();
        cy.contains('ChaosHubs').click();
        
    });

    it('negative test case for chaoshub [Get error when creating chaoshub with same name]', () => {
        cy.contains('ChaosHubs').click();
        cy.contains('New ChaosHub').click();
        cy.get('input[name="name"]').type('testing1');
        cy.contains('Continue').click();
        cy.get('input[name="repoURL"]').type('1');
        cy.get('input[name="repoBranch"]').type('1');
        cy.get('button[aria-label = "Connect Hub"]').click();
        cy.on('window:alert', () => {
            expect(message).to.equal('Name Already exists');
        });
    });

    it('Edit ChaosHub [Change chaoshub name]', () => {
        cy.visit('/login');
        cy.contains('ChaosHubs').click();
        cy.get('.Card--cardMenu .bp3-button').eq(1).click();
        cy.contains('Edit Hub').click();
        cy.get('input[name="name"]').clear().type('sample1');
        cy.contains('Continue').click();
        cy.intercept('POST','/api/query').as('Query');
        cy.get('button[aria-label = "Edit ChaosHub"]').click();
        cy.wait('@Query');
        cy.reload();
        cy.on('window:alert', () => {
            expect(message).to.equal('Chaoshub updated successfully');
        });
    });

    it('Delete ChaosHub', () => {
        cy.visit('/login');
        cy.contains('ChaosHubs').click();
        cy.get('.Card--cardMenu .bp3-button').eq(1).click();
        cy.contains('Delete Hub').click();
        cy.on('window:alert', () => {
            expect(message).to.equal('Hub Deleted Successfully');
        });
    });
});