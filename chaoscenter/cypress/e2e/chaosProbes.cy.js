import { addProbe, deleteprobe, updateProbe } from "../fixtures/chaosprobes";

describe('Testing resilience Probes', () => {
    before(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    });

    it('testing through REST APIs', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');

        //add Probe
        const createProbe_payload = {
            operationName: "addKubernetesHTTPProbe",
            variables: {
                projectID: projectID,
                request: {
                  name: "exp1",
                  description: '',
                  tags: [],
                  type: 'httpProbe',
                  infrastructureType: 'Kubernetes',
                  kubernetesHTTPProperties: {
                    probeTimeout: '1s',
                    interval: '1s',
                    probePollingInterval: '1s',
                    evaluationTimeout: '1s',
                    retry: 5,
                    url: 'http://localhost:3000',
                    method: {
                      get: { criteria: '==', responseCode: '200' }
                    }
                  }
                }
            },
            query: addProbe
        };

        cy.request({
            method: 'POST',
            url: '/api/query',
            body: createProbe_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.addProbe.name).to.equal("exp1");
        });

        //update probe
        const updateProbe_payload = {
            operationName: "updateProbe",
            variables: {
                projectID: projectID,
                request: {
                  name: "exp1",
                  description: '',
                  tags: [],
                  type: 'httpProbe',
                  infrastructureType: 'Kubernetes',
                  kubernetesHTTPProperties: {
                    probeTimeout: '3s',
                    interval: '1s',
                    probePollingInterval: '1s',
                    evaluationTimeout: '1s',
                    retry: 5,
                    url: 'http://localhost:3000',
                    method: {
                      get: { criteria: '==', responseCode: '200' }
                    }
                  }
                }
            },
            query: updateProbe
        };

        cy.request({
            method: 'POST',
            url: '/api/query',
            body: updateProbe_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.updateProbe).to.equal("Updated successfully");
        });

        //delete probe
        const deleteProbe_payload = {
            operationName: 'deleteProbe',
            variables: {
              projectID: projectID,
              probeName: "exp1"
            },
            query: deleteprobe
        }

        cy.request({
            method: 'POST',
            url: '/api/query',
            body: deleteProbe_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.deleteProbe).to.equal(true);
        });
    });

    
    it('Testing through UI', () =>{
        cy.login(Cypress.env('username'),Cypress.env('password'));
        cy.contains('Resilience Probes').click();
        
        //create Probe
        cy.contains('New Probe').click();
        cy.contains('HTTP').click();
        cy.get('input[name="name"]').type('exp100');
        cy.contains('Configure Properties').click();
        cy.get('input[name="kubernetesHTTPProperties.probeTimeout"]').type('1s');
        cy.get('input[name="kubernetesHTTPProperties.interval"]').type('1s');
        cy.get('input[name="kubernetesHTTPProperties.retry"]').type('5');
        cy.get('input[name="kubernetesHTTPProperties.attempt"]').type('5');
        cy.get('input[name="kubernetesHTTPProperties.probePollingInterval"]').type('1s');
        cy.get('input[name="kubernetesHTTPProperties.evaluationTimeout"]').type('1s');
        cy.contains('Configure Details').click();
        cy.get('input[name="kubernetesHTTPProperties.url"]').type('http://localhost:3000');
        cy.get('input[name="kubernetesHTTPProperties.methodDropdown"]').type('GET');
        cy.contains('GET').click();
        cy.get('input[name="kubernetesHTTPProperties.method.get.criteria"]').type('==');
        cy.contains('==').click();
        cy.get('input[name="kubernetesHTTPProperties.method.get.responseCode"]').type('200');
        cy.contains('Setup Probe').click();
        
        //update Probe
        cy.get('.TableV2--cell .bp3-button').eq(0).click();
        cy.contains('Edit Probe').click();
        cy.contains('Configure Properties').click();
        cy.get('input[name="kubernetesHTTPProperties.probeTimeout"]').clear().type('3s');
        cy.contains('Configure Details').click();
        cy.contains('Setup Probe').click();
        cy.on('window alert', () => {
            expect(message).to.equal('Updated successfully');
        });

        //delete probe
        cy.get('.TableV2--cell .bp3-button').click();
        cy.contains('Delete Probe').click();
        cy.contains('Confirm').click();
        cy.wait(2000);
        cy.reload();
    });
});