import { create_env, list_infra, register_infra, update_infra, delete_infra } from "../fixtures/chaosinfra";

describe('testing chaosinfra', () => {
    
    before(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    })

    it('testing chaosinfra through REST APIs', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');

        //create Environment
        const createEnv_payload = {
            operatioName: 'createEnvironment',
            variables: {
                projectID: projectID,
                request: {
                    description: "",
                    environmentID: "exp5",
                    name: "exp5",
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
            expect(response.body.data.createEnvironment.name).to.equal("exp5");
        });


        //create Infra
        const registerInfra_payload = {
            operationName: 'registerInfra',
            variables: {
                projectID: projectID,
                request: {
                    infraScope: 'cluster',
                    name: "exp5",
                    environmentID: "exp5",
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
              request: { environmentIDs: ["exp5"] }, 
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

        cy.wrap(null).then(() => {
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

    it('testing chaosinfra through UI', () => {
        cy.login(Cypress.env('username'),Cypress.env('password'));
        cy.contains('Environments').click();

        //adding chaosinfra
        cy.get('.TableV2--row').eq(0).click();
        cy.contains('Enable Chaos').click();
        cy.get('.bp3-form-content').type('exp97');
        cy.contains('Next').click();
        cy.contains('Next').click();
        cy.contains('Download').click();
        cy.on('window alert', () => {
            expect(message).to.equal('Chaos infrastructure successfully created');
        });
        cy.contains('Done').click();

        //updating chaosinfra
        cy.contains('Update').eq(0).click();
        cy.get('button[aria-label= "Download"]').click();
        cy.on('window alert', () => {
            expect(message).to.equal('Download request successfully sent');
        });
        cy.contains('Done').click();
        cy.on('window alert', () => {
            expect(message).to.equal('Upgrade manifest downloaded successfully');
        });
        
        //disable chaosinfra
        cy.get('.Card--dots').eq(0).click();
        cy.contains('Disable').click();
        cy.contains('Confirm').click();
        cy.on('window alert', () => {
            expect(message).to.equal('Chaos Infrastructure Successfully Disabled');
        });
    });
});