const fs = require("fs");
const path = require("path");

require("./register-ts.cjs");

const {
  renderValidationReportHtml,
  renderValidationReportMarkdown,
  runHardwareValidationSuite
} = require("../lib/validation-framework/engine");

const projectRoot = path.resolve(__dirname, "..");
const reportDirectory = path.join(projectRoot, "docs", "generated");
const markdownPath = path.join(reportDirectory, "hardware-validation-report.md");
const htmlPath = path.join(reportDirectory, "hardware-validation-report.html");

fs.mkdirSync(reportDirectory, { recursive: true });

const suite = runHardwareValidationSuite();

fs.writeFileSync(markdownPath, renderValidationReportMarkdown(suite), "utf8");
fs.writeFileSync(htmlPath, renderValidationReportHtml(suite), "utf8");

console.log("JETS Hardware Knowledge Validation");
console.log(`Overall: ${suite.passed ? "PASS" : "FAIL"}`);
console.log(`Scenario pass rate: ${suite.overallPassRate}%`);
console.log(
  `Scenarios: ${suite.summary.passedScenarios}/${suite.summary.scenarios} passed`
);
console.log(`Playbook fixture failures: ${suite.summary.playbookFailures}`);
console.log(`Platform knowledge warnings: ${suite.summary.platformWarnings}`);
console.log(`Markdown report: ${path.relative(projectRoot, markdownPath)}`);
console.log(`HTML report: ${path.relative(projectRoot, htmlPath)}`);

if (!suite.passed) {
  for (const result of suite.scenarioResults.filter((item) => !item.passed)) {
    console.log("");
    console.log(`Failed scenario: ${result.scenario.title}`);

    for (const assertion of result.assertions.filter((item) => !item.passed)) {
      console.log(
        `- ${assertion.message} Expected ${assertion.expected ?? "(empty)"}, got ${
          assertion.actual ?? "(empty)"
        }.`
      );
    }
  }

  process.exitCode = 1;
}
