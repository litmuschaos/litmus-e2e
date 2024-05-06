import { add_httpProbe, add_CMDProbe, delete_httpprobe, update_httpProbe, update_CMDProbe, delete_CMDprobe, add_PROMProbe, update_PROMProbe, delete_PROMProbe, add_k8sProbe, update_k8sProbe, delete_k8sProbe } from "../../fixtures/chaosprobes";

describe('Testing http chaos Probes', () => {
    beforeEach(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    });

    it('Create chaos probe', () => {
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
    });

    it('negative test case for chaos probe [Get error when creating chaos Probe with same name]', () => {
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
            expect(response.body.errors[0].message).to.equal('write exception: write errors: [E11000 duplicate key error collection: litmus.chaosProbes index: name_1 dup key: { name: "exp1" }]');
        });
    });

    it('Update chaos probe', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');
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
    });

    it('Delete chaos probe', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');
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
});

describe('testing CMD chaos probes', () => {
    beforeEach(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    });

    it('Create chaos probe', () => {
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
    });

    it('negative test case for chaos probe [Get error when creating chaos Probe with same name]', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');
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
            expect(response.body.errors[0].message).to.equal('write exception: write errors: [E11000 duplicate key error collection: litmus.chaosProbes index: name_1 dup key: { name: "exp2" }]');
        });
    });

    it('edit chaos probe', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');
        //update probe
        const updateCMDProbe_payload = {
            operationName: "updateProbe",
            variables: {
                projectID: projectID,
                request: {
                    name: "exp2",
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
    });

    it('delete chaos probe', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');
        //delete probe
        const deleteCMDProbe_payload = {
            operationName: "deleteProbe",
            variables: {
                projectID: projectID,
                probeName: "exp2",
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
});

describe('testing prometheus chaos probes', () => {
    beforeEach(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    });

    it('Create chaos probe', () => {
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
    });

    it('negative test case for chaos probe [Get error when creating chaos Probe with same name]', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');
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
            expect(response.body.errors[0].message).to.equal('write exception: write errors: [E11000 duplicate key error collection: litmus.chaosProbes index: name_1 dup key: { name: "exp3" }]');
        });
    });

    it('edit chaos probe', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');
        //update probe
        const updatePROMProbe_payload = {
            operationName: "updateProbe",
            variables: {
                projectID: projectID,
                request: {
                    name: "exp3",
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
    });

    it('delete chaos probe', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');
         //delete probe
         const deletePROMProbe_payload = {
            operationName: "deleteProbe",
            variables: {
                projectID: projectID,
                probeName: "exp3",
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
});

describe('testing kubernetes chaos probes', () => {
    beforeEach(() => {
        cy.requestLogin(Cypress.env('username'),Cypress.env('password'));
    });

    it('Create chaos probe', () => {
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
    });

    it('negative test case for chaos probe [Get error when creating chaos Probe with same name]', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');
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
            expect(response.body.errors[0].message).to.equal('write exception: write errors: [E11000 duplicate key error collection: litmus.chaosProbes index: name_1 dup key: { name: "exp4" }]');
    
        });
    });

    it('edit chaos probe', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');
        //update probe
        const update_K8SProbe_payload = {
            operationName: "updateProbe",
            variables: {
                projectID: projectID,
                request: {
                    name: "exp4",
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
    });

    it('delete chaos probe', () => {
        const accessToken = localStorage.getItem('accessToken');
        const projectID = localStorage.getItem('projectID');
        //delete probe
        const delete_K8SProbe_payload = {
            operationName: "deleteProbe",
            variables: {
                projectID: projectID,
                probeName: "exp4",
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
});