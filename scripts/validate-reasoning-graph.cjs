const fs = require("fs");
const path = require("path");

require("./register-ts.cjs");

const {
  renderReasoningGraphReportHtml,
  renderReasoningGraphReportMarkdown,
  validateReasoningGraph
} = require("../lib/reasoning-graph/engine");

const projectRoot = path.resolve(__dirname, "..");
const reportDirectory = path.join(projectRoot, "docs", "generated");
const markdownPath = path.join(reportDirectory, "reasoning-graph-report.md");
const htmlPath = path.join(reportDirectory, "reasoning-graph-report.html");

fs.mkdirSync(reportDirectory, { recursive: true });

const result = validateReasoningGraph();

fs.writeFileSync(markdownPath, renderReasoningGraphReportMarkdown(result), "utf8");
fs.writeFileSync(htmlPath, renderReasoningGraphReportHtml(result), "utf8");

console.log("JETS Reasoning Graph Validation");
console.log(`Overall: ${result.passed ? "PASS" : "FAIL"}`);
console.log(`Nodes: ${result.nodeCount}`);
console.log(`Edges: ${result.edgeCount}`);
console.log(`Duplicate edges: ${result.duplicateEdgeCount}`);
console.log(`Orphan nodes: ${result.orphanNodeCount}`);
console.log(`Fixture paths: ${result.pathFixtureCount}/4`);
console.log(`Markdown report: ${path.relative(projectRoot, markdownPath)}`);
console.log(`HTML report: ${path.relative(projectRoot, htmlPath)}`);

if (!result.passed) {
  for (const issue of result.issues.filter((item) => item.severity === "error")) {
    console.log("");
    console.log(`${issue.id}: ${issue.message}`);
  }

  process.exitCode = 1;
}
