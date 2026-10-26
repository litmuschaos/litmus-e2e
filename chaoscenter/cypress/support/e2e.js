import './commands';
import "cypress-localstorage-commands";

before(() => {
  cy.ensureAdminPassword();
});
