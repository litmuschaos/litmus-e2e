import { add_hub } from "../fixtures/chaoshub";
import { create_env } from "../fixtures/chaosinfra";
import { add_CMDProbe, add_PROMProbe, add_httpProbe, add_k8sProbe } from "../fixtures/chaosprobes";

describe('negative test cases for login', () => {
    it('testing with invalid login data through REST APIs', () => {
        cy.request({
            method: "POST",
            url: "auth/login",
            failOnStatusCode: false,
            body: {
                username: 'invalid_user',
                password: 'invalid_password',
            },
        }).then((response) => {
            expect(response.status).to.equal(400);
            expect(response.body.error).to.equal('user does not exist');
        });
    });

    it('testing with invalid login data through UI', () => {
        cy.visit('/login');
        cy.get('input[name="username"]').type('invalid_user');
        cy.get('input[name="password"]').type('invalid_password');
        cy.get('.bp3-button').click();
        cy.on('window:alert', (message) => {
            expect(message).to.equal('user does not exist');
        });
        });
})

describe('negative tests for chaoshub', () => {
    before(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    });

    it('testing with exisitng chaoshub name through REST APIs', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');

        //Add new chaoshub 
        const addPayload = {
            operationName: 'addChaosHub',
            variables: {
            projectID: projectID,
            request: {
                name: 'testing1',
                repoBranch: '1',
                description: '',
                tags: [],
                authType: 'NONE',
                isPrivate: false,
                repoURL: '1',
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
        });
        
        //create chaoshub with same name
        cy.request({
            method: 'POST',
            url: '/api/query', 
            body: addPayload,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then((response) => {
            expect(response.body.errors[0].message).to.equal('Name Already exists');
        });
});

    it('testing with exisitng chaoshub name through UI', () => {
        cy.login(Cypress.env('username'),Cypress.env('password'));
        cy.contains('ChaosHubs').click();
        cy.contains('Disconnected').should('exist');
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
})

describe('negative tests for environment', () => {
    before(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    });

    it('testing with existing environment name through REST APIs', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');

        //create Environment
        const createEnv_payload = {
            operatioName: 'createEnvironment',
            variables: {
                projectID: projectID,
                request: {
                    description: "",
                    environmentID: "exp1",
                    name: "exp1",
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
        });

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
            expect(response.body.errors[0].message).to.equal('write exception: write errors: [E11000 duplicate key error collection: litmus.environment index: environment_id_1 dup key: { environment_id: "exp1" }]');
        });
    })

    it('testing with existing environment name through UI', () => {
        cy.login(Cypress.env('username'),Cypress.env('password'));
        cy.contains('Environments').click();
        cy.contains('New Environment').click();
        cy.get('input[name="name"]').type('exp1');
        cy.contains('Save').click();
        cy.on('alert message', () => {
            expect(message).to.equal('write exception: write errors: [E11000 duplicate key error collection: litmus.environment index: environment_id_1 dup key: { environment_id: "exp1" }]');
        });
    });
});

describe('negative tests for HTTP chaos probe', () => {
    before(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    });

    it('testing with exisiting chaos probe through REST APIs', () => {
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

        //add probe with same name
        cy.request({
            method: 'POST',
            url: '/api/query',
            body: add_httpProbe_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.errors[0].message).to.equal('write exception: write errors: [E11000 duplicate key error collection: litmus.chaosProbes index: name_1 dup key: { name: "exp1" }]');
        });
    })

    it('testing with existing chaos probe name through UI', () => {
        cy.login(Cypress.env('username'),Cypress.env('password'));
        cy.contains('Resilience Probes').click();
        
        //try creating probe with same name
        cy.contains('New Probe').click();
        cy.contains('HTTP').click();
        cy.get('input[name="name"]').type('exp1');
        cy.contains('Configure Properties').click();
        cy.contains('The name exp1 is not unique and was already used before, please provide a unique name').should('exist');
    });
});

describe('negative tests for CMD chaos probe', () => {
    before(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    });

    it('testing with existing chaos probe name through REST APIs', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');

        //add Probe
        const addCMDProbe_payload = {
            operationName: "addKubernetesCMDProbe",
            variables: {
                projectID: projectID,
                request: {
                    name: "exp2",
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
            expect(response.body.data.addProbe.name).to.equal("exp2");
        });

        //add probe with same name
        cy.request({
            method: "POST",
            url: "/api/query",
            body: addCMDProbe_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.errors[0].message).to.equal('write exception: write errors: [E11000 duplicate key error collection: litmus.chaosProbes index: name_1 dup key: { name: "exp2" }]');
        });
    });

    it('testing with exisisting chaos probe name through UI', () => {
        cy.login(Cypress.env('username'),Cypress.env('password'));
        cy.contains('Resilience Probes').click();
        
        //try creating probe with same name
        cy.contains('New Probe').click();
        cy.contains('Command').click();
        cy.get('input[name="name"]').type('exp2');
        cy.contains('Configure Properties').click();
        cy.contains('The name exp2 is not unique and was already used before, please provide a unique name').should('exist');
    });
});

describe('negative tests for prometheus chaos probe', () => {
    before(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    });

    it('testing with existing chaos probe name through REST APIs', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');

        //add Probe
        const addPROMProbe_payload = {
            operationName: "addPROMProbe",
            variables: {
                projectID: projectID,
                request: {
                    name: "exp3",
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
            expect(response.body.data.addProbe.name).to.equal("exp3");
        });

        //add Probe with same name
        cy.request({
            method: "POST",
            url: "/api/query",
            body: addPROMProbe_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.errors[0].message).to.equal('write exception: write errors: [E11000 duplicate key error collection: litmus.chaosProbes index: name_1 dup key: { name: "exp3" }]');
        });
    });

    it('testing with exisisting chaos probe name through UI', () => {
        cy.login(Cypress.env('username'),Cypress.env('password'));
        cy.contains('Resilience Probes').click();
        
        //try creating probe with same name
        cy.contains('New Probe').click();
        cy.contains('Prometheus').click();
        cy.get('input[name="name"]').type('exp3');
        cy.contains('Configure Properties').click();
        cy.contains('The name exp3 is not unique and was already used before, please provide a unique name').should('exist');
    });
});

describe('negative tests for Kubernetes chaos probe', () => {
    before(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    });

    it('testing with existing chaos probe name through REST APIs', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');

        //add Probe
        const add_K8SProbe_payload = {
            operationName: "addK8SProbe",
            variables: {
                projectID: projectID,
                request: {
                    name: "exp4",
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
            expect(response.body.data.addProbe.name).to.equal("exp4");
        });

        //add Porbe with same name
        cy.request({
            method: "POST",
            url: "/api/query",
            body: add_K8SProbe_payload,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.errors[0].message).to.equal('write exception: write errors: [E11000 duplicate key error collection: litmus.chaosProbes index: name_1 dup key: { name: "exp4" }]');
        });
    });

    it('testing with exisisting chaos probe name through UI', () => {
        cy.login(Cypress.env('username'),Cypress.env('password'));
        cy.contains('Resilience Probes').click();
        
        //try creating probe with same name
        cy.contains('New Probe').click();
        cy.contains('Kubernetes').click();
        cy.get('input[name="name"]').type('exp4');
        cy.contains('Configure Properties').click();
        cy.contains('The name exp4 is not unique and was already used before, please provide a unique name').should('exist');
    });
});

