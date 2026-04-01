import type { QAReviewSummary } from "../types.js";

// Doel: QA review samenvatting omzetten naar leesbare markdown
export function renderQaReviewSummaryMarkdown(
  summary: QAReviewSummary,
): string {
  return `# QA Review Summary

## Overall QA readiness
**${summary.overallQaReadiness}**

## Executive summary
${summary.executiveSummary}

## Top QA risks
${renderList(summary.topQaRisks)}

## Clarification points
${renderList(summary.clarificationPoints)}

## Test preparation notes
${renderList(summary.testPreparationNotes)}

## Recommended QA focus
${renderList(summary.recommendedQaFocus)}
`;
}

function renderList(items: string[]): string {
  if (items.length === 0) {
    return "- None";
  }

  return items.map((item) => `- ${item}`).join("\n");
}
