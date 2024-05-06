describe('testing of HTTP chaos probes', () => {
    beforeEach(() => {
        cy.login(Cypress.env('username'),Cypress.env('password'));       
    });

    it('create chaos probe', () => {
        cy.contains('Resilience Probes').click();
        cy.contains('New Probe').click();
        cy.contains('HTTP').click();
        cy.get('input[name="name"]').type('exp11');
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
    });
    
    it('negative test case for chaos probe [Get error when creating chaos Probe with same name]', () => {
        cy.contains('Resilience Probes').click();
        cy.contains('New Probe').click();
        cy.contains('HTTP').click();
        cy.get('input[name="name"]').type('exp11');
        cy.contains('Configure Properties').click();
        cy.contains('The name exp11 is not unique and was already used before, please provide a unique name').should('exist');
    });

    it('update chaos probe', () => {
        cy.contains('Resilience Probes').click();
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
    });

    it('delete chaos probe', () => {
        cy.contains('Resilience Probes').click();
        cy.get('.TableV2--cell .bp3-button').then(buttons => {
            cy.wrap(buttons[buttons.length - 1]).click();
        });
        cy.contains('Delete Probe').click();
        cy.intercept('POST','/api/query').as('Query');
        cy.contains('Confirm').click();
        cy.wait('@Query');
    });     
});

describe('testing of CMD chaos probes', () => {
    beforeEach(() => {
        cy.login(Cypress.env('username'),Cypress.env('password'));       
    });

    it('create chaos probe', () => {
        cy.contains('Resilience Probes').click();
        cy.contains('New Probe').click();
        cy.contains('Command').click();
        cy.get('input[name="name"]').type('exp22');
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
    });

    it('negative test case for chaos probe [Get error when creating chaos Probe with same name]', () => {
        cy.contains('Resilience Probes').click();
        cy.contains('New Probe').click();
        cy.contains('Command').click();
        cy.get('input[name="name"]').type('exp22');
        cy.contains('Configure Properties').click();
        cy.contains('The name exp22 is not unique and was already used before, please provide a unique name').should('exist');
    });

    it('update chaos probe', () => {
        cy.contains('Resilience Probes').click();
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
    });

    it('delete chaos probe', () => {
        cy.contains('Resilience Probes').click();
        cy.get('.TableV2--cell .bp3-button').then(buttons => {
            cy.wrap(buttons[buttons.length - 1]).click();
        });
        cy.contains('Delete Probe').click();
        cy.intercept('POST','/api/query').as('Query');
        cy.contains('Confirm').click();
        cy.wait('@Query');
    });
});

describe('testing of Prometheus chaos probes', () => {
    beforeEach(() => {
        cy.login(Cypress.env('username'),Cypress.env('password'));       
    });

    it('create chaos probe', () => {
        cy.contains('Resilience Probes').click();
        cy.contains('New Probe').click();
        cy.contains('Prometheus').click();
        cy.get('input[name="name"]').type('exp33');
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
    });

    it('negative test case for chaos probe [Get error when creating chaos Probe with same name]', () => {
        cy.contains('Resilience Probes').click();
        cy.contains('New Probe').click();
        cy.contains('Prometheus').click();
        cy.get('input[name="name"]').type('exp33');
        cy.contains('Configure Properties').click();
        cy.contains('The name exp33 is not unique and was already used before, please provide a unique name').should('exist');
    });

    it('update chaos probe', () => {
        cy.contains('Resilience Probes').click();
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
    });

    it('delete chaos probe', () => {
        cy.contains('Resilience Probes').click();
        cy.get('.TableV2--cell .bp3-button').then(buttons => {
            cy.wrap(buttons[buttons.length - 1]).click();
        });
        cy.contains('Delete Probe').click();
        cy.intercept('POST','/api/query').as('Query');
        cy.contains('Confirm').click();
        cy.wait('@Query');
    });
});

describe('testing of kubernetes chaos probes', () => {
    beforeEach(() => {
        cy.login(Cypress.env('username'),Cypress.env('password'));       
    });

    it('create chaos probe', () => {
        cy.contains('Resilience Probes').click();
        cy.contains('New Probe').click();
        cy.contains('Kubernetes').click();
        cy.get('input[name="name"]').type('exp44');
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
    });

    it('negative test case for chaos probe [Get error when creating chaos Probe with same name]', () => {
        cy.contains('Resilience Probes').click();
        cy.contains('New Probe').click();
        cy.contains('Kubernetes').click();
        cy.get('input[name="name"]').type('exp44');
        cy.contains('Configure Properties').click();
        cy.contains('The name exp44 is not unique and was already used before, please provide a unique name').should('exist');
    });

    it('update chaos probe', () => {
        cy.contains('Resilience Probes').click();
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
    });

    it('delete chaos probe', () => {
        cy.contains('Resilience Probes').click();
        cy.get('.TableV2--cell .bp3-button').then(buttons => {
            cy.wrap(buttons[buttons.length - 1]).click();
        });
        cy.contains('Delete Probe').click();
        cy.intercept('POST','/api/query').as('Query');
        cy.contains('Confirm').click();
        cy.wait('@Query');
    });
});