import { add_hub,update_hub,delete_hub, list_hub } from "../../fixtures/chaoshub";

describe('testing chaoshub', () => {
  
  beforeEach(() => {
      cy.restoreLocalStorage();
      cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
  });

  afterEach(() => {
      cy.saveLocalStorage();
  });

    
  it('testing ChaosHub functionality via REST APIs', () => {
    const accessToken = localStorage.getItem('accessToken');
    const projectID = localStorage.getItem('projectID');


    //create chaosHub
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

    //create chaoshub
    cy.request({
      method: 'POST',
      url: '/api/query', 
      body: addPayload,
      headers: {
          Authorization: `Bearer ${accessToken}`
      }
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.data.addChaosHub.name).to.equal('testing');
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
  });

  it('negative test case for chaoshub', () => {
    const accessToken = localStorage.getItem('accessToken');
    const projectID = localStorage.getItem('projectID');

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

    //create chaoshub with same name
    cy.request({
        method: 'POST',
        url: '/api/query', 
        body: addPayload,
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }).then((response) => {
        expect(response.body.errors[0].message).to.equal('name already exists');
    });
  });

  it('edit chaoshub', () => {
    const accessToken = localStorage.getItem('accessToken');
    const projectID = localStorage.getItem('projectID');
    const hubID = localStorage.getItem('hubID');
    
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
  });

  it('delete chaoshub', () => {
    const accessToken = localStorage.getItem('accessToken');
    const projectID = localStorage.getItem('projectID');
    const hubID = localStorage.getItem('hubID');

    //Negative test case for delete chaosHub
    const deletePayload1 = {
      operationName: 'deleteChaosHub',
      variables: {
        hubID: '123', 
        projectID: projectID
      },
      query: delete_hub
    };
    cy.request({
      method: 'POST',
      url: '/api/query',
      body: deletePayload1,
      headers: {
          Authorization: `Bearer ${accessToken}`
      }
    }).then((response) => {
      expect(response.body.errors[0].message).to.equal('mongo: no documents in result');
    });


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
})
