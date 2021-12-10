// Import commands.js using ES2015 syntax:
import "./commands";
import "./pages";

// For preserving cookies between tests.
Cypress.Cookies.defaults({
  preserve: "litmus-cc-token",
});

Cypress.on("uncaught:exception", (err, runnable) => {
  // we expect a 3rd party library error
  // and don't want to fail the test so we return false
  if (
    err.message.includes(
      "Failed to read the 'value' property from 'SVGLength': Could not resolve relative length"
    )
  ) {
    return false;
  }
  // we still want to ensure there are no other unexpected
  // errors, so we let them fail the test
});
