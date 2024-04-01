import { add_hub,update_hub,delete_hub, list_hub } from "../fixtures/chaoshub";

describe('testing chaoshub', () => {

  before(() => {
    cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
  })
    
  it('testing ChaosHub functionality through REST APIs', () => {
    const accessToken = localStorage.getItem('accessToken');
    const projectID = localStorage.getItem('projectID');
      
    //Add new chaoshub with public repo
    const addPayload = {
        operationName: 'addChaosHub',
        variables: {
          projectID: projectID,
          request: {
            name: 'testing',
            repoBranch: 'master',
            description: '',
            tags: [],
            authType: 'NONE',
            isPrivate: false,
            repoURL: 'https://github.com/litmuschaos/chaos-charts',
          },
        },
        query: add_hub,
      };

    cy.request({
        method: 'POST',
        url: '/api/query', 
        body: addPayload,
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data.addChaosHub.name).to.equal("testing");
    });
  

    //get hub id
    const listPayload = {
        operationName: 'listChaosHub',
        variables: {
          projectID: projectID,
          request: { filter: { chaosHubName: "" } }
        },
        query: list_hub,
      };
      
      cy.request({
        method: 'POST',
        url: '/api/query',
        body: listPayload,
        headers: {
          Authorization: `Bearer ${accessToken}` 
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        localStorage.setItem('hubID',response.body.data.listChaosHub[1].id);
      });

    cy.wrap(null).then(() => {
        const hubID = localStorage.getItem('hubID');


    //update chaoshub
    const updatePayload = {
        operationName: 'updateChaosHub',
        variables: {
          projectID: projectID, 
          request: {
            id: hubID,
            name: 'sample',
            repoBranch: 'master',
            description: '',
            authType: 'NONE',
            isPrivate: false,
            repoURL: 'https://github.com/litmuschaos/chaos-charts',
            sshPrivateKey: '',
            sshPublicKey: '',
            tags: [],
            token: ''
          }
        },
        query: update_hub
      };
    cy.request({
        method: 'POST',
        url: '/api/query',
        body: updatePayload,
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
        }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data.updateChaosHub.name).to.equal("sample")
    });


    //delete chaoshub
    const deletePayload = {
        operationName: 'deleteChaosHub',
        variables: {
          hubID: hubID, 
          projectID: projectID
        },
        query: delete_hub
      };
    cy.request({
        method: 'POST',
        url: '/api/query',
        body: deletePayload,
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data.deleteChaosHub).to.equal(true);
      });
  });
  });

  it('testing ChaosHub functionality through UI', () => {

    cy.login(Cypress.env('username'),Cypress.env('password'));
    cy.visit('/dashboard');
    cy.contains('ChaosHubs').click();
    cy.contains('Litmus ChaosHub').should('exist');
    cy.contains('Connected').should('exist');


    //Add new chaoshub with public repo
    cy.contains('New ChaosHub').click();
    cy.get('input[name="name"]').type('testing');
    cy.contains('Continue').click();
    cy.get('input[name="repoURL"]').type('https://github.com/litmuschaos/chaos-charts.git');
    cy.get('input[name="repoBranch"]').type('master');
    cy.get('button[aria-label = "Connect Hub"]').click();
    cy.wait(30000);
    cy.on('window:alert', () => {
        expect(message).to.equal('Chaoshub added successfully');
    });

    
    //Checks if chaoshub is connected
    cy.get('[class="chaos_ChaosHubs-module_connectionStatus_PWHgAA"]').eq(1).contains('Connected').should('exist');
    cy.get('.bp3-card').eq(1).click();
    cy.contains('Chaos Faults (50)').should('exist');
    cy.contains('ChaosHubs').click();
    

    //Updating chaoshub name
    cy.get('.Card--cardMenu .bp3-button').eq(1).click();
    cy.contains('Edit Hub').click();
    cy.get('input[name="name"]').clear().type('sample');
    cy.contains('Continue').click();
    cy.get('button[aria-label = "Edit ChaosHub"]').click();
    cy.wait(30000);
    cy.reload();
    cy.on('window:alert', () => {
        expect(message).to.equal('Chaoshub updated successfully');
    });


    //delete chaoshub
    cy.get('.Card--cardMenu .bp3-button').eq(1).click();
    cy.contains('Delete Hub').click();
    cy.on('window:alert', () => {
        expect(message).to.equal('Hub Deleted Successfully');
    });
  });
});
