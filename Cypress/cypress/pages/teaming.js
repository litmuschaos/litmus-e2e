//Custom command for validating projects details.
Cypress.Commands.add(
  "validateProjectsDetails",
  ({ totalProjects, ownedProjects, invitationsRecieved }) => {
    cy.get("[data-cy=totalProjectsCount]").should("have.text", totalProjects);
    cy.get("[data-cy=ownedProjectsCount]").should("have.text", ownedProjects);
    cy.get("[data-cy=otherProjectsCount]").should(
      "have.text",
      totalProjects - ownedProjects
    );
    cy.get("[data-cy=invitationsCount]").should(
      "have.text",
      invitationsRecieved
    );
  }
);

//Custom command for inviting a user using UI.
Cypress.Commands.add("inviteUser", (name, role) => {
  cy.get("[data-cy=inviteNewMemberButton]").click();
  cy.get("[data-cy=inviteNewMemberModal]").should("be.visible");

  cy.get("[data-cy=inviteNewMemberSearch] input").clear().type(name); //Searching user with given name here

  cy.get("[data-cy=modal]").within(() => {
    cy.get("[data-cy=inviteNewMemberTable]").within(() => {
      cy.get("[data-cy=inviteNewMemberRow]").get("span").first().click();
      cy.get("[data-cy=selectRole] button").click();
    });
  });

  cy.get(`[data-cy=${role}Role]`).click();

  cy.get("[data-cy=modal]").within(() => {
    // Sending invite
    cy.get("[data-cy=inviteNewMemberSendInviteButton] button").click();

    //Validating the Success Modal
    cy.get("[data-cy=inviteNewMemberSuccessModal]").within(() => {
      cy.get("[data-cy=inviteNewMemberSuccessModalDoneButton] button").click();
    });
  });
});

//Custom command for validating the sent invitation in the table.
Cypress.Commands.add(
  "validateMember",
  ({ username, role, email, shouldExist }) => {
    const currentRole = role.charAt(0).toUpperCase() + role.slice(1);
    if (shouldExist == true) {
      cy.get("[data-cy=teamingTableRow]")
        .children()
        .eq(0)
        .should("have.text", `${userInitials(username)}${username}`);
      cy.get("[data-cy=teamingTableRow]")
        .children()
        .eq(1)
        .should("have.text", currentRole);
      cy.get("[data-cy=teamingTableRow]")
        .children()
        .eq(2)
        .should("have.text", email);
    } else {
      cy.get("[data-cy=teamingTableRow]").should("not.exist");
    }
  }
);

//Custom command for validating the sent invitation in the table.
Cypress.Commands.add(
  "validateSentInvite",
  ({ username, role, email, status, shouldExist }) => {
    const currentRole = role.charAt(0).toUpperCase() + role.slice(1);
    if (shouldExist === true) {
      cy.get("[data-cy=teamingTableRow]")
        .children()
        .eq(0)
        .should("have.text", `${userInitials(username)}${username}`);
      cy.get("[data-cy=teamingTableRow]")
        .children()
        .eq(1)
        .should("have.text", currentRole);
      cy.get("[data-cy=teamingTableRow]")
        .children()
        .eq(2)
        .should("have.text", email);
      cy.get("[data-cy=teamingTableRow]")
        .children()
        .eq(3)
        .should("have.text", status);
    } else {
      cy.get("[data-cy=teamingTableRow]").should("not.exist");
    }
  }
);

Cypress.Commands.add("switchProject", () => {
  cy.get("[data-cy=headerProjectDropdown] button").click();
  cy.get("[data-cy=projectDropDownItem]").eq(1).click();
});

function userInitials(name) {
  /**
   * Funtion to return the initials of a users name
   * @param {string} name - The string from which initials need to be extracted
   * @return {string} instance - The concatenated initials of the @param name
   */

  try {
    // Trim to ensure no trailing whitespaces, and,
    // Split the name based on white spaces in between
    const nameArray = name.trim().split(" ");
    // if no last name is entered, return the first name's initial letter
    if (nameArray.length < 2) {
      return nameArray[0][0].toUpperCase();
    }
    // concatenate first and last word's first letter to ensure
    // middle name, aliases, etc. don't get counted
    return (
      nameArray[0][0].toUpperCase() +
      nameArray[nameArray.length - 1][0].toUpperCase()
    );
  } catch (error) {
    console.error(
      "Error in extracting the user name: ",
      error,
      "returning '' for now..."
    );
    return "";
  }
}
