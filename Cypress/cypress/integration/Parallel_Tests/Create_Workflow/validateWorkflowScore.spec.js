// <reference types="Cypress" />
import * as user from "../../../fixtures/Users.json";

describe("Testing the validation of the final verdict and resilience score", () => {
	before("Loggin in and checking if agent exists", () => {
		cy.requestLogin(user.AdminName, user.AdminPassword);
		cy.waitForCluster("Self-Agent");
		cy.visit("/workflows");
	});

	it("Checking final verdict and resilience score", () => {
		cy.GraphqlWait("workflowListDetails", "listSchedules");
		cy.get("[data-cy=runs]").click();
		cy.wait("@listSchedules").its("response.statusCode").should("eq", 200);
		cy.wait(1000);
		let invalidScoreOrVerdict = false;
		const checkVerdictScore = new Promise((resolve, reject) => {
			cy.get("table")
				.find("tr")
				.then(($div) => {
					cy.wrap($div)
						.find("td")
						.eq(4)
						.each(() => {
							cy.wrap($div)
								.find("p")
								.each(($p) => {
									// span attribute having text as "Overall RR : "
									if ($p.find("span").eq(0).text() === "Overall RR : ") {
										// span attribute next to "Overall RR : "
										const resScore = parseFloat($p.find("span").eq(1).text());
										/** 
										 * makes the invalidScoreOrVerdict flag true if found resScore a Not a Number (NaN) type, 
										 * negative or greater than 100 
										 */
										if (isNaN(resScore) || resScore < 0 || resScore > 100) {
											invalidScoreOrVerdict = true;
										}
									}
									// span attribute having text as "Experiments Passed : " 
									else if ($p.find("span").eq(0).text() == "Experiments Passed : ") {
										// span attribute next to "Experiments Passed : "
										const expPassed = $p.find("span").eq(1).text();
										/**
										 * check if Experiments passed field has NA value
										 * incase of Experiments having running status,  
										 * if not eval the expression (Ex:- eval(1/2))
										 */
										const expPassedEval = (expPassed === "NA") ? expPassed : eval(expPassed);
										/** 
										 * makes the invalidScoreOrVerdict flag true if not found expPassedEval "NA" and 
										 * negative or greater than 1 
										 */
										if (expPassedEval !== "NA" && (isNaN(expPassedEval) || expPassedEval < 0 || expPassedEval > 1)) {
											invalidScoreOrVerdict = true;
										}
									}
								});
						});
				})
				.then(() => {
					resolve({
						type: "success",
						message: (invalidScoreOrVerdict) ? "Invalid Verdict or Resilience Score" : "Valid Verdict and Resilience Score"
					});
				});
		});
		cy.wrap(checkVerdictScore)
			.its("message")
			.should("eq", "Valid Verdict and Resilience Score");
	});
});