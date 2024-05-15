import { create_env, list_infra, register_infra, update_infra, delete_infra } from "../../fixtures/chaosinfra";

describe('testing chaosinfra via REST APIs', () => {
    
    beforeEach(() => {
        cy.restoreLocalStorage();
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    });

    afterEach(() => {
        cy.saveLocalStorage();
    });

    
    it('Create Environment and Chaos infra', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');

        //create Environment
        const createEnv_payload = {
            operatioName: 'createEnvironment',
            variables: {
                projectID: projectID,
                request: {
                    description: "",
                    environmentID: "exp99",
                    name: "exp99",
                    tags: [],
                    type: "NON_PROD"
                }
            },
            query: create_env
        };

        cy.request({
            method: 'POST',
            url: '/api/query',
            body: createEnv_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.createEnvironment.name).to.equal("exp99");
        });


        //create Infra
        const registerInfra_payload = {
            operationName: 'registerInfra',
            variables: {
                projectID: projectID,
                request: {
                    infraScope: 'cluster',
                    name: "exp99",
                    environmentID: "exp99",
                    description: '',
                    platformName: 'Kubernetes',
                    infraNamespace: 'litmus',
                    infraNsExists: false,
                    infraSaExists: false,
                    infrastructureType: 'Kubernetes',
                    serviceAccount: 'litmus',
                    skipSsl: false,
                }
            },
            query: register_infra
        };

        cy.request({
            method: 'POST',
            url: '/api/query',
            body: registerInfra_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data).to.have.property('registerInfra');
        })


        //get InfraID
        const listInfra_payload = {
            operationName: 'listInfras',
            variables: {
              projectID: projectID,
              request: { environmentIDs: ["exp99"] }, 
            },
            query: list_infra
        };

        cy.request({
            method: 'POST',
            url: '/api/query', 
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            body: listInfra_payload,
          }).then((response) => {
            expect(response.status).to.equal(200);
            localStorage.setItem('infraID', response.body.data.listInfras.infras[0].infraID);
          });   
        });

        
        
    it('Negative test case [Get error for creating environment with existing environment name', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');
      
        //create Environment
        const createEnv_payload = {
            operatioName: 'createEnvironment',
            variables: {
                projectID: projectID,
                request: {
                    description: "",
                    environmentID: "exp99",
                    name: "exp99",
                    tags: [],
                    type: "NON_PROD"
                }
            },
            query: create_env
        };

        //create environment with same name
        cy.request({
            method: 'POST',
            url: '/api/query',
            body: createEnv_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.errors[0].message).to.equal('write exception: write errors: [E11000 duplicate key error collection: litmus.environment index: environment_id_1 dup key: { environment_id: "exp99" }]');
        });
    });

    it('Update chaos infra', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');           
        const infraID = localStorage.getItem('infraID');

        //update Infra
        const updateInfra_payload = {
            operationName: 'getInfraManifest',
            variables: {
            projectID: projectID,
            infraID: infraID,
            upgrade: true,
            },
            query: update_infra,
        };

        cy.request({
            method: 'POST',
            url: '/api/query', 
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            body: updateInfra_payload,
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data).to.have.property('getInfraManifest');
        });
    });

    it('Disable chaos infra', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');           
        const infraID = localStorage.getItem('infraID');

        //negative test case for disable infra
        const deleteInfra_payload1 = {
            operationName: 'deleteInfra',
            variables: {
            projectID: projectID,
            infraID: '123',
            },
            query: delete_infra,
        };

        cy.request({
            method: 'POST',
            url: '/api/query', 
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            body: deleteInfra_payload1,
        }).then((response) => {
            expect(response.body.errors[0].message).to.equal('mongo: no documents in result');
        });


        //disable Infra
        const deleteInfra_payload = {
            operationName: 'deleteInfra',
            variables: {
            projectID: projectID,
            infraID: infraID,
            },
            query: delete_infra,
        };

        cy.request({
            method: 'POST',
            url: '/api/query', 
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            body: deleteInfra_payload,
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.deleteInfra).to.equal("infra deleted successfully");
        });
    });
});
