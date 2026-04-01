import { CombinedRequirementsReviewOrchestrator } from "./orchestrator/combinedRequirementsReviewOrchestrator.js";
import { QAReviewAggregator } from "./orchestrator/qaReviewAggregator.js";
import { writeQaReviewSummaryFiles } from "./utils/writeQaReviewSummary.js";
import type { CombinedRequirementsReview, QAReviewSummary } from "./types.js";

// Doel: QA review samenvatting leesbaar tonen in de terminal
function printQaReviewSummary(
  summary: QAReviewSummary,
  review: CombinedRequirementsReview,
) {
  console.log("\nQA review summary");
  console.log(`Readiness: ${summary.overallQaReadiness}\n`);

  console.log("Executive summary:");
  console.log(summary.executiveSummary);

  console.log("\nTop QA risks:");

  const stateRisks = review.missingStates.missingStates.slice(0, 3);
  const validationRisks = review.missingValidations.missingValidations.slice(
    0,
    3,
  );
  const permissionRisks = review.missingPermissions.missingPermissions.slice(
    0,
    3,
  );

  if (
    stateRisks.length === 0 &&
    validationRisks.length === 0 &&
    permissionRisks.length === 0 &&
    summary.topQaRisks.length === 0
  ) {
    console.log("- Geen belangrijke QA-risico's gevonden");
  } else {
    for (const finding of stateRisks) {
      console.log(`- ${finding.text}`);

      for (const evidence of finding.evidence) {
        const snippetPart = evidence.snippet
          ? ` | snippet: ${evidence.snippet}`
          : "";

        console.log(
          `  ↳ ${evidence.sourceType} (${evidence.sourceLabel}): ${evidence.reason}${snippetPart}`,
        );
      }
    }

    for (const finding of validationRisks) {
      console.log(`- ${finding.text}`);

      for (const evidence of finding.evidence) {
        const snippetPart = evidence.snippet
          ? ` | snippet: ${evidence.snippet}`
          : "";

        console.log(
          `  ↳ ${evidence.sourceType} (${evidence.sourceLabel}): ${evidence.reason}${snippetPart}`,
        );
      }
    }

    for (const finding of permissionRisks) {
      console.log(`- ${finding.text}`);

      for (const evidence of finding.evidence) {
        const snippetPart = evidence.snippet
          ? ` | snippet: ${evidence.snippet}`
          : "";

        console.log(
          `  ↳ ${evidence.sourceType} (${evidence.sourceLabel}): ${evidence.reason}${snippetPart}`,
        );
      }
    }

    const explainedRiskTexts = new Set([
      ...stateRisks.map((finding) => finding.text),
      ...validationRisks.map((finding) => finding.text),
      ...permissionRisks.map((finding) => finding.text),
    ]);

    const remainingRisks = summary.topQaRisks.filter((risk) => {
      for (const explainedRiskText of explainedRiskTexts) {
        if (risk.includes(explainedRiskText)) {
          return false;
        }
      }
      return true;
    });

    for (const item of remainingRisks) {
      console.log(`- ${item}`);
    }
  }
}

async function main() {
  const confluencePageId = process.argv[2];
  const figmaFileKey = process.argv[3];
  const figmaNodeId = process.argv[4];

  if (!confluencePageId) {
    throw new Error(
      "Use: pnpm exec tsx src/qaReviewSummary.ts <confluencePageId> [figmaFileKey] [figmaNodeId]",
    );
  }

  const reviewOrchestrator = new CombinedRequirementsReviewOrchestrator();
  const aggregator = new QAReviewAggregator();

  const review = await reviewOrchestrator.evaluate({
    confluencePageId,
    figmaFileKey,
    figmaNodeId,
  });

  const summary = aggregator.aggregate(review);

  printQaReviewSummary(summary, review);

  const output = writeQaReviewSummaryFiles({
    summary,
    baseFileName: `qa-review-summary-${confluencePageId}`,
  });

  console.log("Bestanden geschreven:");
  console.log(`- JSON: ${output.jsonPath}`);
  console.log(`- Markdown: ${output.mdPath}`);
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
