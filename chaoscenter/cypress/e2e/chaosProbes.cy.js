import { add_httpProbe, add_CMDProbe, delete_httpprobe, update_httpProbe, update_CMDProbe, delete_CMDprobe, add_PROMProbe, update_PROMProbe, delete_PROMProbe, add_k8sProbe, update_k8sProbe, delete_k8sProbe } from "../fixtures/chaosprobes";

describe('Testing http chaos Probes', () => {
    before(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    });

    it('testing through REST APIs', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');

        //add Probe
        const add_httpProbe_payload = {
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
            query: add_httpProbe
        };

        cy.request({
            method: 'POST',
            url: '/api/query',
            body: add_httpProbe_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.addProbe.name).to.equal("exp1");
        });

        //update probe
        const update_httpProbe_payload = {
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
            query: update_httpProbe
        };

        cy.request({
            method: 'POST',
            url: '/api/query',
            body: update_httpProbe_payload,
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
            query: delete_httpprobe
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
        cy.get('input[name="name"]').type('exp2');
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
        cy.get('.TableV2--cell .bp3-button').then(buttons => {
            cy.wrap(buttons[buttons.length - 1]).click();
        });
        cy.contains('Edit Probe').click();
        cy.contains('Configure Properties').click();
        cy.get('input[name="kubernetesHTTPProperties.probeTimeout"]').clear().type('3s');
        cy.contains('Configure Details').click();
        cy.contains('Setup Probe').click();
        cy.on('window alert', () => {
            expect(message).to.equal('Updated successfully');
        });

        //delete probe
        cy.get('.TableV2--cell .bp3-button').then(buttons => {
            cy.wrap(buttons[buttons.length - 1]).click();
        });
        cy.contains('Delete Probe').click();
        cy.intercept('POST','/api/query').as('Query');
        cy.contains('Confirm').click();
        cy.wait('@Query');
    });
});

describe('testing CMD chaos probes', () => {
    before(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    });

    it('testing through REST APIs', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');

        //add Probe
        const addCMDProbe_payload = {
            operationName: "addKubernetesCMDProbe",
            variables: {
                projectID: projectID,
                request: {
                    name: "exp3",
                    description: "",
                    tags: [],
                    type: "cmdProbe",
                    infrastructureType: "Kubernetes",
                    kubernetesCMDProperties: {
                        probeTimeout: "1s",
                        interval: "1s",
                        retry: 1,
                        attempt: 1,
                        probePollingInterval: "1s",
                        evaluationTimeout: "1s",
                        command: "run",
                        comparator: {
                            type: "int",
                            criteria: "==",
                            value: "1",
                        },
                    },
                },
            },
            query: add_CMDProbe,
        };
        
        cy.request({
            method: "POST",
            url: "/api/query",
            body: addCMDProbe_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.addProbe.name).to.equal("exp3");
        });

        //update probe
        const updateCMDProbe_payload = {
            operationName: "updateProbe",
            variables: {
                projectID: projectID,
                request: {
                    name: "exp3",
                    description: "",
                    tags: [],
                    type: "cmdProbe",
                    infrastructureType: "Kubernetes",
                    kubernetesCMDProperties: {
                        probeTimeout: "3s",
                        interval: "1s",
                        retry: 1,
                        attempt: 1,
                        evaluationTimeout: "1s",
                        probePollingInterval: "1s",
                        initialDelay: null,
                        stopOnFailure: null,
                        command: "run",
                        comparator: {
                            type: "int",
                            value: "1",
                            criteria: "==",
                        },
                        source: null,
                    },
                },
            },
            query: update_CMDProbe,
        };
        
        cy.request({
            method: "POST",
            url: "/api/query",
            body: updateCMDProbe_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.updateProbe).to.equal("Updated successfully");
        });

        //delete probe
        const deleteCMDProbe_payload = {
            operationName: "deleteProbe",
            variables: {
                projectID: projectID,
                probeName: "exp3",
            },
            query: delete_CMDprobe,
        };
        
        cy.request({
            method: "POST",
            url: "/api/query",
            body: deleteCMDProbe_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.deleteProbe).to.equal(true);
        });
        
    });

    it('testing through UI', () => {
        cy.login(Cypress.env('username'),Cypress.env('password'));
        cy.contains('Resilience Probes').click();
        
        //create Probe
        cy.contains('New Probe').click();
        cy.contains('Command').click();
        cy.get('input[name="name"]').type('exp4');
        cy.contains('Configure Properties').click();
        cy.get('input[name="kubernetesCMDProperties.probeTimeout"]').type('1s');
        cy.get('input[name="kubernetesCMDProperties.interval"]').type('1s');
        cy.get('input[name="kubernetesCMDProperties.retry"]').type('5');
        cy.get('input[name="kubernetesCMDProperties.attempt"]').type('5');
        cy.get('input[name="kubernetesCMDProperties.probePollingInterval"]').type('1s');
        cy.get('input[name="kubernetesCMDProperties.evaluationTimeout"]').type('1s');
        cy.contains('Configure Details').click();
        cy.get('textarea[name="kubernetesCMDProperties.command"]').type('run');
        cy.get('input[name="kubernetesCMDProperties.comparator.type"]').type('int');
        cy.contains('Int').click();
        cy.get('input[name="kubernetesCMDProperties.comparator.criteria"]').type('==');
        cy.contains('==').click();
        cy.get('input[name="kubernetesCMDProperties.comparator.value"]').type('1');
        cy.contains('Setup Probe').click();
        
        //update Probe
        cy.get('.TableV2--cell .bp3-button').then(buttons => {
            cy.wrap(buttons[buttons.length - 1]).click();
        });
        cy.contains('Edit Probe').click();
        cy.contains('Configure Properties').click();
        cy.get('input[name="kubernetesCMDProperties.probeTimeout"]').clear().type('3s');
        cy.contains('Configure Details').click();
        cy.contains('Setup Probe').click();
        cy.on('window alert', () => {
            expect(message).to.equal('Updated successfully');
        });

        //delete probe
        cy.get('.TableV2--cell .bp3-button').then(buttons => {
            cy.wrap(buttons[buttons.length - 1]).click();
        });
        cy.contains('Delete Probe').click();
        cy.intercept('POST','/api/query').as('Query');
        cy.contains('Confirm').click();
        cy.wait('@Query');
    });
});

describe('testing prometheus chaos probes', () => {
    before(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    });

    it('testing through REST APIs', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');

        //add Probe
        const addPROMProbe_payload = {
            operationName: "addPROMProbe",
            variables: {
                projectID: projectID,
                request: {
                    name: "exp5",
                    description: "",
                    tags: [],
                    type: "promProbe",
                    infrastructureType: "Kubernetes",
                    promProperties: {
                        probeTimeout: "1s",
                        interval: "1s",
                        retry: 1,
                        attempt: 1,
                        probePollingInterval: "1s",
                        evaluationTimeout: "1s",
                        endpoint: "http://localhost:3000",
                        query: "run",
                        comparator: {
                            type: "int",
                            criteria: "==",
                            value: "1",
                        },
                    },
                },
            },
            query: add_PROMProbe,
        };
        
        cy.request({
            method: "POST",
            url: "/api/query",
            body: addPROMProbe_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.addProbe.name).to.equal("exp5");
        });
        
        //update probe
        const updatePROMProbe_payload = {
            operationName: "updateProbe",
            variables: {
                projectID: projectID,
                request: {
                    name: "exp5",
                    description: "",
                    tags: [],
                    type: "promProbe",
                    infrastructureType: "Kubernetes",
                    promProperties: {
                        probeTimeout: "3s",
                        interval: "1s",
                        retry: 1,
                        attempt: 1,
                        evaluationTimeout: "1s",
                        probePollingInterval: "1s",
                        initialDelay: null,
                        stopOnFailure: null,
                        endpoint: "http://localhost:3000",
                        query: "run",
                        queryPath: null,
                        comparator: {
                            type: "int",
                            value: "1",
                            criteria: "==",
                        },
                    },
                },
            },
            query: update_PROMProbe,
        };
        
        cy.request({
            method: "POST",
            url: "/api/query",
            body: updatePROMProbe_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.updateProbe).to.equal("Updated successfully");
        });

        //delete probe
        const deletePROMProbe_payload = {
            operationName: "deleteProbe",
            variables: {
                projectID: projectID,
                probeName: "exp5",
            },
            query: delete_PROMProbe,
        };
        
        cy.request({
            method: "POST",
            url: "/api/query",
            body: deletePROMProbe_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.deleteProbe).to.equal(true);
        });
        
        
    });

    it('testing through UI', () => {
        cy.login(Cypress.env('username'),Cypress.env('password'));
        cy.contains('Resilience Probes').click();
        
        //create Probe
        cy.contains('New Probe').click();
        cy.contains('Prometheus').click();
        cy.get('input[name="name"]').type('exp6');
        cy.contains('Configure Properties').click();
        cy.get('input[name="promProperties.probeTimeout"]').type('1s');
        cy.get('input[name="promProperties.interval"]').type('1s');
        cy.get('input[name="promProperties.retry"]').type('5');
        cy.get('input[name="promProperties.attempt"]').type('5');
        cy.get('input[name="promProperties.probePollingInterval"]').type('1s');
        cy.get('input[name="promProperties.evaluationTimeout"]').type('1s');
        cy.contains('Configure Details').click();
        cy.get('input[name="promProperties.endpoint"]').type('http://localhost:3000');
        cy.get('textarea[name="promProperties.query"]').type('run');
        cy.get('input[name="promProperties.comparator.type"]').type('int');
        cy.contains('Int').click();
        cy.get('input[name="promProperties.comparator.criteria"]').type('==');
        cy.contains('==').click();
        cy.get('input[name="promProperties.comparator.value"]').type('1');
        cy.contains('Setup Probe').click();
        
        //update Probe
        cy.get('.TableV2--cell .bp3-button').then(buttons => {
            cy.wrap(buttons[buttons.length - 1]).click();
        });
        cy.contains('Edit Probe').click();
        cy.contains('Configure Properties').click();
        cy.get('input[name="promProperties.probeTimeout"]').clear().type('3s');
        cy.contains('Configure Details').click();
        cy.contains('Setup Probe').click();
        cy.on('window alert', () => {
            expect(message).to.equal('Updated successfully');
        });

        //delete probe
        cy.get('.TableV2--cell .bp3-button').then(buttons => {
            cy.wrap(buttons[buttons.length - 1]).click();
        });
        cy.contains('Delete Probe').click();
        cy.intercept('POST','/api/query').as('Query');
        cy.contains('Confirm').click();
        cy.wait('@Query');
    });
});

describe('testing kubernetes chaos probes', () => {
    before(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    });

    it('testing through REST APIs', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');

        //add Probe
        const add_K8SProbe_payload = {
            operationName: "addK8SProbe",
            variables: {
                projectID: projectID,
                request: {
                    name: "exp7",
                    description: "",
                    tags: [],
                    type: "k8sProbe",
                    infrastructureType: "Kubernetes",
                    k8sProperties: {
                        probeTimeout: "1s",
                        interval: "1s",
                        retry: 1,
                        attempt: 1,
                        probePollingInterval: "1s",
                        evaluationTimeout: "1s",
                        group: "book",
                        version: "v1",
                        resource: "store",
                        namespace: "alpha",
                        operation: "delete",
                    },
                },
            },
            query: add_k8sProbe,
        };
        
        cy.request({
            method: "POST",
            url: "/api/query",
            body: add_K8SProbe_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.addProbe.name).to.equal("exp7");
        });
        
        //update probe
        const update_K8SProbe_payload = {
            operationName: "updateProbe",
            variables: {
                projectID: projectID,
                request: {
                    name: "exp7",
                    description: "",
                    tags: [],
                    type: "k8sProbe",
                    infrastructureType: "Kubernetes",
                    k8sProperties: {
                        probeTimeout: "3s",
                        interval: "1s",
                        retry: 1,
                        attempt: 1,
                        evaluationTimeout: "1s",
                        probePollingInterval: "1s",
                        initialDelay: null,
                        stopOnFailure: null,
                        group: "book",
                        version: "v1",
                        resource: "store",
                        resourceNames: null,
                        namespace: "alpha",
                        fieldSelector: null,
                        labelSelector: null,
                        operation: "delete",
                    },
                },
            },
            query: update_k8sProbe,
        };
        
        cy.request({
            method: "POST",
            url: "/api/query",
            body: update_K8SProbe_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.updateProbe).to.equal("Updated successfully");
        });
        
        //delete probe
        const delete_K8SProbe_payload = {
            operationName: "deleteProbe",
            variables: {
                projectID: projectID,
                probeName: "exp7",
            },
            query: delete_k8sProbe,
        };
        
        cy.request({
            method: "POST",
            url: "/api/query",
            body: delete_K8SProbe_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.deleteProbe).to.equal(true);
        });
        
    });

    it('testing through UI', () => {
        cy.login(Cypress.env('username'),Cypress.env('password'));
        cy.contains('Resilience Probes').click();
        
        //create Probe
        cy.contains('New Probe').click();
        cy.contains('Kubernetes').click();
        cy.get('input[name="name"]').type('exp8');
        cy.contains('Configure Properties').click();
        cy.get('input[name="k8sProperties.probeTimeout"]').type('1s');
        cy.get('input[name="k8sProperties.interval"]').type('1s');
        cy.get('input[name="k8sProperties.retry"]').type('5');
        cy.get('input[name="k8sProperties.attempt"]').type('5');
        cy.get('input[name="k8sProperties.probePollingInterval"]').type('1s');
        cy.get('input[name="k8sProperties.evaluationTimeout"]').type('1s');
        cy.contains('Configure Details').click();
        cy.get('input[name="k8sProperties.group"]').type('book');
        cy.get('input[name="k8sProperties.version"]').type('v1');
        cy.get('input[name="k8sProperties.resource"]').type('store');
        cy.get('input[name="k8sProperties.namespace"]').type('alpha');
        cy.get('input[name="k8sProperties.operation"]').type('delete');
        cy.contains('Delete').click();
        cy.contains('Setup Probe').click();
        
        //update Probe
        cy.get('.TableV2--cell .bp3-button').then(buttons => {
            cy.wrap(buttons[buttons.length - 1]).click();
        });
        cy.contains('Edit Probe').click();
        cy.contains('Configure Properties').click();
        cy.get('input[name="k8sProperties.probeTimeout"]').clear().type('3s');
        cy.contains('Configure Details').click();
        cy.contains('Setup Probe').click();
        cy.on('window alert', () => {
            expect(message).to.equal('Updated successfully');
        });

        //delete probe
        cy.get('.TableV2--cell .bp3-button').then(buttons => {
            cy.wrap(buttons[buttons.length - 1]).click();
        });
        cy.contains('Delete Probe').click();
        cy.intercept('POST','/api/query').as('Query');
        cy.contains('Confirm').click();
        cy.wait('@Query');
    });
});