import {
  getOpportunityCategoryForPath,
  getReasoningGraphEdgeLabel,
  getReasoningGraphNodeLabel,
  reasoningGraph
} from "@/data/reasoning-graph";
import {
  reasoningGraphEdgeTypes,
  reasoningGraphNodeTypes
} from "@/types/reasoning-graph";
import type { PlatformKnowledgeId } from "@/types/platform-knowledge";
import type {
  ReasoningGraph,
  ReasoningGraphConstraint,
  ReasoningGraphEdge,
  ReasoningGraphEdgeType,
  ReasoningGraphNode,
  ReasoningGraphNodeType,
  ReasoningGraphOpportunity,
  ReasoningGraphPath,
  ReasoningPathDisplayValidationResult,
  ReasoningPathExplanation,
  ReasoningGraphReferenceContext,
  ReasoningGraphValidationIssue,
  ReasoningGraphValidationResult
} from "@/types/reasoning-graph";

type FindReasoningPathsOptions = {
  edgeTypes?: ReasoningGraphEdgeType[];
  limit?: number;
  maxDepth?: number;
  targetNodeId?: ReasoningGraphNode["id"];
  targetNodeType?: ReasoningGraphNodeType;
};

const defaultTraversalEdgeTypes: ReasoningGraphEdgeType[] = [
  "adapter_path",
  "better_value",
  "commonly_upgraded_with",
  "improves",
  "repair_path",
  "shares_repair_path",
  "supports",
  "upgrades",
  "works_better_with"
];

const constraintEdgeTypes: ReasoningGraphEdgeType[] = [
  "blocks",
  "bottlenecks",
  "higher_power",
  "power_conflict",
  "thermal_conflict",
  "requires"
];

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function getNodeMap(graph: ReasoningGraph) {
  return new Map(graph.nodes.map((node) => [node.id, node]));
}

function getEdgeMap(graph: ReasoningGraph) {
  return new Map(graph.edges.map((edge) => [edge.id, edge]));
}

function getOutgoingEdges(
  graph: ReasoningGraph,
  nodeId: string,
  edgeTypes: ReasoningGraphEdgeType[]
) {
  return graph.edges.filter(
    (edge) => edge.from === nodeId && edgeTypes.includes(edge.type)
  );
}

function formatPathSummary(pathEdges: ReasoningGraphEdge[]) {
  return pathEdges
    .map((edge) => getReasoningGraphEdgeLabel(edge.type))
    .join(" -> ");
}

function toReasoningPath(
  graph: ReasoningGraph,
  nodeIds: string[],
  edgeIds: string[]
): ReasoningGraphPath {
  const edgeMap = new Map(graph.edges.map((edge) => [edge.id, edge]));
  const pathEdges = edgeIds
    .map((edgeId) => edgeMap.get(edgeId))
    .filter((edge): edge is ReasoningGraphEdge => Boolean(edge));
  const firstNodeLabel = getReasoningGraphNodeLabel(nodeIds[0]);
  const lastNodeLabel = getReasoningGraphNodeLabel(nodeIds[nodeIds.length - 1]);
  const strength = pathEdges.reduce((total, edge) => total + edge.strength, 0);

  return {
    edgeIds,
    id: `path:${edgeIds.join("|")}`,
    nodeIds,
    scoreDelta: Math.round(strength * 4),
    summary: formatPathSummary(pathEdges),
    title: `${firstNodeLabel} -> ${lastNodeLabel}`
  };
}

export function getReasoningPathById(
  pathId: string,
  graph: ReasoningGraph = reasoningGraph
) {
  if (!pathId.startsWith("path:")) {
    return null;
  }

  const edgeIds = pathId.replace(/^path:/, "").split("|").filter(Boolean);
  const edgeMap = getEdgeMap(graph);
  const nodeIds: string[] = [];

  for (const [index, edgeId] of edgeIds.entries()) {
    const edge = edgeMap.get(edgeId);

    if (!edge) {
      return null;
    }

    if (index === 0) {
      nodeIds.push(edge.from);
    } else if (nodeIds[nodeIds.length - 1] !== edge.from) {
      return null;
    }

    nodeIds.push(edge.to);
  }

  return edgeIds.length > 0 ? toReasoningPath(graph, nodeIds, edgeIds) : null;
}

export function getReasoningPathExplanation(
  pathOrId: ReasoningGraphPath | string,
  graph: ReasoningGraph = reasoningGraph
): ReasoningPathExplanation | null {
  const path =
    typeof pathOrId === "string"
      ? getReasoningPathById(pathOrId, graph)
      : pathOrId;

  if (!path) {
    return null;
  }

  const nodeMap = getNodeMap(graph);
  const edgeMap = getEdgeMap(graph);
  const pathEdges = path.edgeIds
    .map((edgeId) => edgeMap.get(edgeId))
    .filter((edge): edge is ReasoningGraphEdge => Boolean(edge));

  if (pathEdges.length === 0) {
    return null;
  }

  const nodeLabels = path.nodeIds.map(
    (nodeId) => nodeMap.get(nodeId)?.label ?? getReasoningGraphNodeLabel(nodeId)
  );
  const steps = pathEdges.map((edge) => ({
    confidence: edge.confidence,
    edgeId: edge.id,
    evidenceIds: edge.evidenceIds ?? [],
    fromNodeId: edge.from,
    reason: edge.reason,
    relationshipLabel: getReasoningGraphEdgeLabel(edge.type),
    toNodeId: edge.to
  }));
  const relationshipLabels = steps.map((step) => step.relationshipLabel);
  const evidenceIds = unique(steps.flatMap((step) => step.evidenceIds));
  const confidence = Math.round(
    steps.reduce((total, step) => total + step.confidence, 0) /
      Math.max(1, steps.length)
  );
  const explanationReasons = unique(steps.map((step) => step.reason)).slice(0, 2);

  return {
    confidence,
    edgeIds: path.edgeIds,
    evidenceIds,
    id: path.id,
    nodeLabels,
    plainEnglish: `JETS links ${nodeLabels[0]} to ${
      nodeLabels[nodeLabels.length - 1]
    } through ${unique(relationshipLabels).join(", ")}. ${explanationReasons.join(" ")}`,
    relationshipLabels,
    steps,
    title: path.title
  };
}

export function getReasoningPathExplanationsForIds(
  pathIds: string[],
  graph: ReasoningGraph = reasoningGraph
) {
  return unique(pathIds)
    .map((pathId) => getReasoningPathExplanation(pathId, graph))
    .filter(
      (explanation): explanation is ReasoningPathExplanation =>
        Boolean(explanation)
    );
}

export function findReasoningPaths(
  startNodeId: string,
  options: FindReasoningPathsOptions = {},
  graph: ReasoningGraph = reasoningGraph
) {
  const nodeMap = getNodeMap(graph);
  const edgeTypes = options.edgeTypes ?? defaultTraversalEdgeTypes;
  const limit = options.limit ?? 8;
  const maxDepth = options.maxDepth ?? 5;
  const results: ReasoningGraphPath[] = [];

  if (!nodeMap.has(startNodeId)) {
    return results;
  }

  function visit(
    currentNodeId: string,
    visitedNodeIds: string[],
    visitedEdgeIds: string[]
  ) {
    if (results.length >= limit || visitedEdgeIds.length >= maxDepth) {
      return;
    }

    for (const edge of getOutgoingEdges(graph, currentNodeId, edgeTypes)) {
      if (visitedNodeIds.includes(edge.to)) {
        continue;
      }

      const nextNode = nodeMap.get(edge.to);

      if (!nextNode) {
        continue;
      }

      const nextNodeIds = [...visitedNodeIds, edge.to];
      const nextEdgeIds = [...visitedEdgeIds, edge.id];
      const isTarget =
        (options.targetNodeId && edge.to === options.targetNodeId) ||
        (options.targetNodeType && nextNode.type === options.targetNodeType);

      if (isTarget) {
        results.push(toReasoningPath(graph, nextNodeIds, nextEdgeIds));

        if (results.length >= limit) {
          return;
        }
      }

      visit(edge.to, nextNodeIds, nextEdgeIds);
    }
  }

  visit(startNodeId, [startNodeId], []);

  return results;
}

export function getReasoningPathsForPlatform(
  platformId: PlatformKnowledgeId,
  limit = 6
) {
  return findReasoningPaths(`platform:${platformId}`, {
    edgeTypes: defaultTraversalEdgeTypes,
    limit,
    maxDepth: 5,
    targetNodeType: "opportunity"
  });
}

export function getConstraintPathsForPlatform(
  platformId: PlatformKnowledgeId,
  limit = 5
) {
  return findReasoningPaths(`platform:${platformId}`, {
    edgeTypes: constraintEdgeTypes,
    limit,
    maxDepth: 4
  });
}

export function getReasoningGraphSummaryForPlatform(
  platformId: PlatformKnowledgeId
) {
  const platformNodeId = `platform:${platformId}`;
  const relatedEdges = reasoningGraph.edges.filter(
    (edge) => edge.from === platformNodeId || edge.to === platformNodeId
  );
  const relatedNodeIds = unique(
    relatedEdges.flatMap((edge) => [edge.from, edge.to])
  );

  return {
    constraintPathCount: getConstraintPathsForPlatform(platformId).length,
    edgeCount: relatedEdges.length,
    nodeCount: relatedNodeIds.length,
    opportunityPathCount: getReasoningPathsForPlatform(platformId).length
  };
}

export function discoverGraphOpportunities(
  platformId: PlatformKnowledgeId
): ReasoningGraphOpportunity[] {
  return getReasoningPathsForPlatform(platformId, 8).map((path, index) => {
    const edges = path.edgeIds
      .map((edgeId) => reasoningGraph.edges.find((edge) => edge.id === edgeId))
      .filter((edge): edge is ReasoningGraphEdge => Boolean(edge));

    return {
      category: getOpportunityCategoryForPath(edges),
      confidence: Math.min(
        96,
        Math.round(
          edges.reduce((total, edge) => total + edge.confidence, 0) /
            Math.max(1, edges.length)
        )
      ),
      explanationPath: path,
      id: `opportunity:${platformId}:${index + 1}`,
      title: path.title
    };
  });
}

export function discoverGraphConstraints(
  platformId: PlatformKnowledgeId
): ReasoningGraphConstraint[] {
  return getConstraintPathsForPlatform(platformId, 8).map((path, index) => {
    const edges = path.edgeIds
      .map((edgeId) => reasoningGraph.edges.find((edge) => edge.id === edgeId))
      .filter((edge): edge is ReasoningGraphEdge => Boolean(edge));
    const hasBlockingEdge = edges.some((edge) => edge.type === "blocks");

    return {
      confidence: Math.min(
        96,
        Math.round(
          edges.reduce((total, edge) => total + edge.confidence, 0) /
            Math.max(1, edges.length)
        )
      ),
      explanationPath: path,
      id: `constraint:${platformId}:${index + 1}`,
      severity: hasBlockingEdge ? "blocking" : "warning",
      title: path.title
    };
  });
}

export function getReasoningGraphPathIdsForContext(
  context: ReasoningGraphReferenceContext
) {
  if (context.platformId) {
    const paths = [
      ...getReasoningPathsForPlatform(context.platformId, 4),
      ...getConstraintPathsForPlatform(context.platformId, 3)
    ];

    return unique(paths.map((path) => path.id));
  }

  if (context.strategyType) {
    return findReasoningPaths(`strategy:${context.strategyType}`, {
      edgeTypes: ["supports", "requires", "improves"],
      limit: 3,
      maxDepth: 3,
      targetNodeType: "project"
    }).map((path) => path.id);
  }

  if (context.adapterId) {
    return findReasoningPaths(`adapter:${context.adapterId}`, {
      edgeTypes: ["supports", "requires", "improves"],
      limit: 3,
      maxDepth: 3,
      targetNodeType: "project"
    }).map((path) => path.id);
  }

  if (context.acquisitionId) {
    return findReasoningPaths(`acquisition:${context.acquisitionId}`, {
      edgeTypes: ["repair_path", "supports"],
      limit: 3,
      maxDepth: 4,
      targetNodeType: "strategy"
    }).map((path) => path.id);
  }

  return [];
}

function findDuplicateEdges(graph: ReasoningGraph) {
  const seen = new Set<string>();
  const duplicates: ReasoningGraphEdge[] = [];

  for (const edge of graph.edges) {
    const key = `${edge.from}:${edge.to}:${edge.type}`;

    if (seen.has(key)) {
      duplicates.push(edge);
    }

    seen.add(key);
  }

  return duplicates;
}

function findOrphanNodes(graph: ReasoningGraph) {
  const connectedNodeIds = new Set(
    graph.edges.flatMap((edge) => [edge.from, edge.to])
  );

  return graph.nodes.filter((node) => !connectedNodeIds.has(node.id));
}

function hasRequiresCycle(graph: ReasoningGraph) {
  const requiresEdges = graph.edges.filter((edge) => edge.type === "requires");
  const edgesByFrom = new Map<string, ReasoningGraphEdge[]>();

  for (const edge of requiresEdges) {
    edgesByFrom.set(edge.from, [...(edgesByFrom.get(edge.from) ?? []), edge]);
  }

  function visit(nodeId: string, trail: string[]): boolean {
    if (trail.includes(nodeId)) {
      return true;
    }

    return (edgesByFrom.get(nodeId) ?? []).some((edge) =>
      visit(edge.to, [...trail, nodeId])
    );
  }

  return graph.nodes.some((node) => visit(node.id, []));
}

function validateFixturePaths(graph: ReasoningGraph) {
  return [
    findReasoningPaths("platform:thinkstation-p510", {
      edgeTypes: ["supports", "adapter_path", "improves", "upgrades"],
      maxDepth: 5,
      targetNodeId: "opportunity:platform-potential"
    }, graph)[0],
    findReasoningPaths("platform:optiplex-7060", {
      edgeTypes: ["blocks", "higher_power", "bottlenecks"],
      maxDepth: 4,
      targetNodeId: "component-category:gpu"
    }, graph)[0],
    findReasoningPaths("acquisition:manual-capture", {
      edgeTypes: ["repair_path", "supports"],
      maxDepth: 3,
      targetNodeId: "strategy:repair-existing-hardware"
    }, graph)[0],
    findReasoningPaths("opportunity:wait-for-value", {
      edgeTypes: ["better_value"],
      maxDepth: 2,
      targetNodeId: "strategy:wait-for-better-value"
    }, graph)[0]
  ].filter((path): path is ReasoningGraphPath => Boolean(path));
}

function collectDisplayValidationPaths(graph: ReasoningGraph) {
  const paths = [...validateFixturePaths(graph)];

  for (const node of graph.nodes) {
    if (node.type === "platform") {
      paths.push(
        ...findReasoningPaths(node.id, {
          edgeTypes: defaultTraversalEdgeTypes,
          limit: 3,
          maxDepth: 5,
          targetNodeType: "opportunity"
        }, graph),
        ...findReasoningPaths(node.id, {
          edgeTypes: constraintEdgeTypes,
          limit: 3,
          maxDepth: 4,
          targetNodeType: "constraint"
        }, graph)
      );
    }

    if (node.type === "strategy" || node.type === "adapter") {
      paths.push(
        ...findReasoningPaths(node.id, {
          edgeTypes: ["supports", "requires", "improves", "adapter_path"],
          limit: 2,
          maxDepth: 4,
          targetNodeType: "project"
        }, graph)
      );
    }

    if (node.type === "acquisition") {
      paths.push(
        ...findReasoningPaths(node.id, {
          edgeTypes: ["repair_path", "supports"],
          limit: 2,
          maxDepth: 4,
          targetNodeType: "strategy"
        }, graph)
      );
    }
  }

  return [...new Map(paths.map((path) => [path.id, path])).values()];
}

export function validateReasoningPathDisplay(
  paths = collectDisplayValidationPaths(reasoningGraph),
  graph: ReasoningGraph = reasoningGraph
): ReasoningPathDisplayValidationResult {
  const nodeMap = getNodeMap(graph);
  const edgeMap = getEdgeMap(graph);
  const issues: ReasoningGraphValidationIssue[] = [];

  for (const path of paths) {
    if (path.nodeIds.length < 2 || path.edgeIds.length === 0) {
      issues.push({
        id: `display-path-empty:${path.id}`,
        message: `Reasoning display path ${path.id} does not contain enough nodes or edges.`,
        severity: "error"
      });
    }

    if (new Set(path.nodeIds).size !== path.nodeIds.length) {
      issues.push({
        id: `display-path-cycle:${path.id}`,
        message: `Reasoning display path ${path.id} repeats a node.`,
        severity: "error"
      });
    }

    for (const [index, nodeId] of path.nodeIds.entries()) {
      const node = nodeMap.get(nodeId);

      if (!node) {
        issues.push({
          id: `display-path-broken-node:${path.id}:${nodeId}`,
          message: `Reasoning display path ${path.id} references missing node ${nodeId}.`,
          severity: "error"
        });
      } else if (!node.label.trim()) {
        issues.push({
          id: `display-path-missing-node-label:${path.id}:${index}`,
          message: `Reasoning display path ${path.id} has a node without a display label.`,
          severity: "error"
        });
      }
    }

    for (const [index, edgeId] of path.edgeIds.entries()) {
      const edge = edgeMap.get(edgeId);

      if (!edge) {
        issues.push({
          id: `display-path-broken-edge:${path.id}:${edgeId}`,
          message: `Reasoning display path ${path.id} references missing edge ${edgeId}.`,
          severity: "error"
        });
        continue;
      }

      if (path.nodeIds[index] !== edge.from || path.nodeIds[index + 1] !== edge.to) {
        issues.push({
          id: `display-path-broken-sequence:${path.id}:${edgeId}`,
          message: `Reasoning display path ${path.id} has a broken node-to-edge sequence.`,
          severity: "error"
        });
      }

      if (!getReasoningGraphEdgeLabel(edge.type).trim() || !edge.reason.trim()) {
        issues.push({
          id: `display-path-missing-edge-label:${path.id}:${edgeId}`,
          message: `Reasoning display path ${path.id} has an edge without display text.`,
          severity: "error"
        });
      }
    }
  }

  return {
    issues,
    passed: issues.every((issue) => issue.severity !== "error"),
    pathCount: paths.length
  };
}

export function validateReasoningGraph(
  graph: ReasoningGraph = reasoningGraph
): ReasoningGraphValidationResult {
  const nodeIds = new Set(graph.nodes.map((node) => node.id));
  const duplicateEdges = findDuplicateEdges(graph);
  const orphanNodes = findOrphanNodes(graph);
  const fixturePaths = validateFixturePaths(graph);
  const displayPathValidation = validateReasoningPathDisplay(
    collectDisplayValidationPaths(graph),
    graph
  );
  const issues: ReasoningGraphValidationIssue[] = [
    ...displayPathValidation.issues
  ];

  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      issues.push({
        id: `broken-reference:${edge.id}`,
        message: `Broken graph edge reference: ${edge.id}.`,
        severity: "error"
      });
    }
  }

  if (duplicateEdges.length > 0) {
    issues.push({
      id: "duplicate-edges",
      message: `${duplicateEdges.length} duplicate graph edge relationship(s) detected.`,
      severity: "error"
    });
  }

  if (orphanNodes.length > 0) {
    issues.push({
      id: "orphan-nodes",
      message: `${orphanNodes.length} graph node(s) have no relationships.`,
      severity: "warning"
    });
  }

  if (hasRequiresCycle(graph)) {
    issues.push({
      id: "requires-cycle",
      message: "Circular dependency detected in requires relationships.",
      severity: "error"
    });
  }

  const missingNodeTypes = reasoningGraphNodeTypes.filter(
    (nodeType) => !graph.nodes.some((node) => node.type === nodeType)
  );
  const missingEdgeTypes = reasoningGraphEdgeTypes.filter(
    (edgeType) => !graph.edges.some((edge) => edge.type === edgeType)
  );

  for (const nodeType of missingNodeTypes) {
    issues.push({
      id: `missing-node-type:${nodeType}`,
      message: `Graph has no ${nodeType} node.`,
      severity: "error"
    });
  }

  for (const edgeType of missingEdgeTypes) {
    issues.push({
      id: `missing-edge-type:${edgeType}`,
      message: `Graph has no ${edgeType.replaceAll("_", " ")} relationship.`,
      severity: "error"
    });
  }

  if (fixturePaths.length < 4) {
    issues.push({
      id: "missing-fixture-paths",
      message: "Required deterministic reasoning paths are missing.",
      severity: "error"
    });
  }

  return {
    displayPathCount: displayPathValidation.pathCount,
    duplicateEdgeCount: duplicateEdges.length,
    edgeCount: graph.edges.length,
    issues,
    nodeCount: graph.nodes.length,
    orphanNodeCount: orphanNodes.length,
    passed: issues.every((issue) => issue.severity !== "error"),
    pathFixtureCount: fixturePaths.length
  };
}

export function renderReasoningGraphReportMarkdown(
  result: ReasoningGraphValidationResult
) {
  const issueRows =
    result.issues.length > 0
      ? result.issues
          .map(
            (issue) =>
              `| ${issue.severity.toUpperCase()} | ${issue.id} | ${issue.message} |`
          )
          .join("\n")
      : "| PASS | None | No graph validation issues. |";
  const edgeRows = reasoningGraphEdgeTypes
    .map((edgeType) => {
      const count = reasoningGraph.edges.filter((edge) => edge.type === edgeType).length;

      return `| ${edgeType.replaceAll("_", " ")} | ${count} |`;
    })
    .join("\n");

  return `# JETS Reasoning Graph Validation

Generated by \`npm run validate:graph\`.

## Summary

| Metric | Value |
| --- | ---: |
| Status | ${result.passed ? "PASS" : "FAIL"} |
| Nodes | ${result.nodeCount} |
| Edges | ${result.edgeCount} |
| Duplicate edges | ${result.duplicateEdgeCount} |
| Orphan nodes | ${result.orphanNodeCount} |
| Fixture paths | ${result.pathFixtureCount}/4 |
| Display paths | ${result.displayPathCount} |

## Edge Coverage

| Relationship | Count |
| --- | ---: |
${edgeRows}

## Issues

| Severity | ID | Message |
| --- | --- | --- |
${issueRows}
`;
}

export function renderReasoningGraphReportHtml(
  result: ReasoningGraphValidationResult
) {
  const issueRows =
    result.issues.length > 0
      ? result.issues
          .map(
            (issue) =>
              `<tr><td>${issue.severity.toUpperCase()}</td><td>${issue.id}</td><td>${issue.message}</td></tr>`
          )
          .join("")
      : "<tr><td>PASS</td><td>None</td><td>No graph validation issues.</td></tr>";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>JETS Reasoning Graph Validation</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 32px; color: #0f172a; }
      table { border-collapse: collapse; width: 100%; margin: 16px 0 28px; }
      th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
      th { background: #f8fafc; }
    </style>
  </head>
  <body>
    <h1>JETS Reasoning Graph Validation</h1>
    <table>
      <tbody>
        <tr><th>Status</th><td>${result.passed ? "PASS" : "FAIL"}</td></tr>
        <tr><th>Nodes</th><td>${result.nodeCount}</td></tr>
        <tr><th>Edges</th><td>${result.edgeCount}</td></tr>
        <tr><th>Duplicate edges</th><td>${result.duplicateEdgeCount}</td></tr>
        <tr><th>Orphan nodes</th><td>${result.orphanNodeCount}</td></tr>
        <tr><th>Fixture paths</th><td>${result.pathFixtureCount}/4</td></tr>
        <tr><th>Display paths</th><td>${result.displayPathCount}</td></tr>
      </tbody>
    </table>
    <h2>Issues</h2>
    <table>
      <thead><tr><th>Severity</th><th>ID</th><th>Message</th></tr></thead>
      <tbody>${issueRows}</tbody>
    </table>
  </body>
</html>
`;
}
