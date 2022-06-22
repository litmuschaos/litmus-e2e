/// <reference types="Cypress" />

import * as user from "../../../fixtures/Users.json";
import endpoints from "../../../fixtures/endpoints";
import { unauthorized, invalid_request } from "../../../fixtures/errorCodes";

let adminAccessToken, user1AccessToken, user1Id, adminUserId;

before("Clear Database", () => {
  cy.task("clearDB");
});

describe("Testing get request to status api", () => {
  it("Testing status api", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.status(),
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("status");
      expect(res.body.status).to.eq("up");
    });
  });
});

describe("Testing post request to login api", () => {
  it("Testing login api without password [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.login(),
      body: {
        username: user.AdminName,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(invalid_request);
    });
  });

  it("Testing login api without username [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.login(),
      body: {
        password: user.AdminPassword,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(invalid_request);
    });
  });

  it("Testing login api with incorrect password [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.login(),
      body: {
        username: user.AdminName,
        password: "SomeInvalidPassword",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq("invalid_credentials");
    });
  });

  it("Testing login api with correct password", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.login(),
      body: {
        username: user.AdminName,
        password: user.AdminPassword,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("access_token");
      expect(res.body).to.have.property("expires_in");
      adminAccessToken = res.body.access_token;
    });
  });
});

describe("Testing post request to createUser api", () => {
  it("Testing create api without access_token [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.createUser(),
      body: {
        ...user.user1,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing create api with missing username [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.createUser(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        ...user.user1,
        username: "",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(invalid_request);
    });
  });

  it("Testing create api with missing password [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.createUser(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        ...user.user1,
        password: "",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(invalid_request);
    });
  });

  it("Testing create api with missing role [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.createUser(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        ...user.user1,
        role: "",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(invalid_request);
    });
  });

  it("Testing create api with invalid role [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.createUser(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        ...user.user1,
        role: "abc",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(invalid_request);
    });
  });

  it("Creating a new user by an admin role user", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.createUser(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        ...user.user1,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("username");
      expect(res.body).to.have.property("role");
      user1Id = res.body._id;
    });
  });

  it("Creating a new user by a non-admin role user [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.login(),
      body: {
        username: user.user1.username,
        password: user.user1.password,
      },
    })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("access_token");
        expect(res.body).to.have.property("expires_in");
        user1AccessToken = res.body.access_token;
      })
      .then(() => {
        return cy.request({
          method: "POST",
          url: Cypress.env("authURL") + endpoints.createUser(),
          headers: {
            authorization: `Bearer ${user1AccessToken}`,
          },
          body: {
            ...user.user2,
          },
          failOnStatusCode: false,
        });
      })
      .then((res) => {
        expect(res.body).to.have.property("error");
        expect(res.body).to.have.property("error_description");
        expect(res.body.error).to.eq(unauthorized);
      });
  });

  it("Creating a new user with existing username [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.createUser(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        ...user.user1,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq("user_exists");
    });
  });
});

describe("Testing get request to getAllUsers api", () => {
  it("Testing api without access_token [ Should not be possible ]", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.getAllUsers(),
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api by admin", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.getAllUsers(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.not.eq(0);
      res.body.forEach((userData) => {
        expect(userData).to.have.property("_id");
        expect(userData).to.have.property("username");
        expect(userData).to.have.property("role");
        if (userData.username === user.AdminName) {
          adminUserId = userData._id;
        }
      });
    });
  });

  it("Testing api by user", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.getAllUsers(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.not.eq(0);
      res.body.forEach((userData) => {
        expect(userData).to.have.property("_id");
        expect(userData).to.have.property("username");
        expect(userData).to.have.property("role");
      });
    });
  });
});

describe("Testing get request to getUserById api", () => {
  it("Testing api without access_token [ Should not be possible ]", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.getUserById(adminUserId),
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api by admin role user to get admin details", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.getUserById(adminUserId),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("username");
      expect(res.body).to.have.property("role");
    });
  });

  it("Testing api by admin role user to get user1 details", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.getUserById(user1Id),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("username");
      expect(res.body).to.have.property("role");
    });
  });

  it("Testing api by user role user to get admin details", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.getUserById(adminUserId),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("username");
      expect(res.body).to.have.property("role");
    });
  });

  it("Testing api by user role user to get user1 details", () => {
    cy.request({
      method: "GET",
      url: Cypress.env("authURL") + endpoints.getUserById(user1Id),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("username");
      expect(res.body).to.have.property("role");
    });
  });
});

describe("Testing post request to updateDetails api", () => {
  it("Testing api without access_token [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updateDetails(),
      body: {
        name: user.user1.name,
        email: user.user1.email,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api from admin account", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updateDetails(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        name: "abc",
        email: "test@test.com",
      },
    })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("message");
        return cy.request({
          method: "GET",
          url: Cypress.env("authURL") + endpoints.getUserById(adminUserId),
          headers: {
            authorization: `Bearer ${adminAccessToken}`,
          },
        });
      })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.name).to.eq("abc");
        expect(res.body.email).to.eq("test@test.com");
      });
  });

  it("Testing api from user account", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updateDetails(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        name: "abc",
        email: "test@test.com",
      },
    })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("message");
        return cy.request({
          method: "GET",
          url: Cypress.env("authURL") + endpoints.getUserById(user1Id),
          headers: {
            authorization: `Bearer ${user1AccessToken}`,
          },
        });
      })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.name).to.eq("abc");
        expect(res.body.email).to.eq("test@test.com");
      });
  });
});

describe("Testing post request to updateState api", () => {
  it("Testing api without access_token [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updateState(),
      body: {
        username: user.user1.username,
        is_deactivate: true,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api from admin account without username [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updateState(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        is_deactivate: true,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
    });
  });

  // Should give error but currently considering null value to be false
  it("Testing api from admin account without is_deactivate [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updateState(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        username: user.user1.username,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(invalid_request);
    });
  });

  it("Testing api from user account [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updateState(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        username: user.user1.username,
        is_deactivate: true,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api by deactivating user from admin account", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updateState(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        username: user.user1.username,
        is_deactivate: true,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("message");
    });
  });

  it("Testing api by activating user from admin account", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updateState(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        username: user.user1.username,
        is_deactivate: false,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("message");
    });
  });
});

describe("Testing post request to updatePassword api", () => {
  it("Testing api without access_token [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updatePassword(),
      body: {
        username: user.user1.username,
        old_password: user.user1.password,
        new_password: "updated_password",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api without old_password [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updatePassword(),
      body: {
        username: user.user1.username,
        new_password: "updated_password",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
    });
  });

  it("Testing api without new_password [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updatePassword(),
      body: {
        username: user.user1.username,
        old_password: user.user1.username,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
    });
  });

  it("Testing api without wrong old_password [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updatePassword(),
      body: {
        username: user.user1.username,
        old_password: "wrong_password",
        new_passowrd: "updated_password",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
    });
  });

  it("Changing user1 password", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.updatePassword(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        old_password: user.user1.password,
        new_password: "updated_password",
      },
    })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("message");
        return cy.request({
          method: "POST",
          url: Cypress.env("authURL") + endpoints.login(),
          body: {
            username: user.user1.username,
            password: user.user1.password,
          },
          failOnStatusCode: false,
        });
      })
      .then((res) => {
        expect(res.body).to.have.property("error");
        expect(res.body).to.have.property("error_description");
        expect(res.body.error).to.eq("invalid_credentials");
        return cy.request({
          method: "POST",
          url: Cypress.env("authURL") + endpoints.login(),
          body: {
            username: user.user1.username,
            password: "updated_password",
          },
        });
      })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("access_token");
        user1AccessToken = res.body.access_token;
      });
  });
});

describe("Testing post request to resetPassword api", () => {
  it("Testing api without access_token [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.resetPassword(),
      body: {
        username: user.user1.username,
        new_password: "updated_password",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api by non-admin user [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.resetPassword(),
      headers: {
        authorization: `Bearer ${user1AccessToken}`,
      },
      body: {
        username: user.user1.username,
        new_password: user.user1.password,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
      expect(res.body.error).to.eq(unauthorized);
    });
  });

  it("Testing api without username [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.resetPassword(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        new_password: "updated_password",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
    });
  });

  it("Testing api without password [ Should not be possible ]", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.resetPassword(),
      body: {
        username: user.user1.username,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("error_description");
    });
  });

  it("Changing user1 password from admin account", () => {
    cy.request({
      method: "POST",
      url: Cypress.env("authURL") + endpoints.resetPassword(),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
      },
      body: {
        username: user.user1.username,
        new_password: user.user1.password,
      },
    })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("message");
        return cy.request({
          method: "POST",
          url: Cypress.env("authURL") + endpoints.login(),
          body: {
            username: user.user1.username,
            password: "updated_password",
          },
          failOnStatusCode: false,
        });
      })
      .then((res) => {
        expect(res.body).to.have.property("error");
        expect(res.body).to.have.property("error_description");
        expect(res.body.error).to.eq("invalid_credentials");
        return cy.request({
          method: "POST",
          url: Cypress.env("authURL") + endpoints.login(),
          body: {
            username: user.user1.username,
            password: user.user1.password,
          },
        });
      })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("access_token");
        user1AccessToken = res.body.access_token;
      });
  });
});
