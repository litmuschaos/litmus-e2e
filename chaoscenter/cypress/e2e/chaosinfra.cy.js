import { create_env, list_infra, register_infra, update_infra, delete_infra } from "../fixtures/chaosinfra";

describe('testing chaosinfra', () => {
    /*
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
                    environmentID: "kkkkkkk",
                    name: "kkkkkkk",
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
            expect(response.body.data.createEnvironment.name).to.equal("kkkkkkk");
        });


        //create Infra
        const registerInfra_payload = {
            operationName: 'registerInfra',
            variables: {
                projectID: projectID,
                request: {
                    infraScope: 'cluster',
                    name: "kkkkkkk",
                    environmentID: "kkkkkkk",
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
        })


        //get InfraID
        const listInfra_payload = {
            operationName: 'listInfras',
            variables: {
              projectID: projectID,
              request: { environmentID: 'kkkkkkk' }, 
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
            localStorage.setItem('infraID', response.body.data.listInfras.infras.infraID);
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
    });*/

    it('testing chaosinfra through UI', () => {
        cy.login(Cypress.env('username'),Cypress.env('password'));

        //creating environment
        cy.contains('Environments').click();
        cy.contains('New Environment').click();
        cy.get('input[name= "name"]').type('sample12');
        cy.contains('Save').click();

        //adding chaosinfra
        cy.contains('sample12').should('exist');
        cy.get('.TableV2--row').click();
        cy.contains('Enable Chaos').click();
        cy.get('.bp3-form-content').type('sample12');
        cy.contains('Next').click();
        cy.contains('Next').click();
        cy.contains('Download').click();
        cy.on('window alert', () => {
            expect(message).to.equal('Chaos infrastructure successfully created');
        });
        cy.contains('Done').click();

        //updating chaosinfra
        cy.contains('Update').click();
        cy.get('button[aria-label= "Download"]').click();
        cy.on('window alert', () => {
            expect(message).to.equal('Download request successfully sent');
        });
        cy.contains('Done').click();
        cy.on('window alert', () => {
            expect(message).to.equal('Upgrade manifest downloaded successfully');
        });
        
        //disable chaosinfra
        cy.get('.Card--dots').click();
        cy.contains('Disable').click();
        cy.contains('Confirm').click();
        cy.on('window alert', () => {
            expect(message).to.equal('Chaos Infrastructure Successfully Disabled');
        });
    });
})