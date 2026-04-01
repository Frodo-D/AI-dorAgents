import { CombinedRequirementsReviewOrchestrator } from "./orchestrator/combinedRequirementsReviewOrchestrator.js";
import { writeCombinedRequirementsReviewFiles } from "./utils/writeCombinedRequirementsReview.js";
import type { CombinedRequirementsReview } from "./types.js";

// Doel: gecombineerde review kort en leesbaar tonen in de terminal
function printCombinedRequirementsReview(review: CombinedRequirementsReview) {
  console.log("\nCombined requirements review");
  console.log(`Status: ${review.overallStatus}\n`);

  console.log("Executive summary:");
  console.log(review.executiveSummary);

  console.log("\nKey risks:");
  if (review.keyRisks.length === 0) {
    console.log("- Geen belangrijke risico's gevonden");
  } else {
    for (const item of review.keyRisks) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nRecommendations:");
  if (review.recommendations.length === 0) {
    console.log("- Geen aanvullende aanbevelingen");
  } else {
    for (const item of review.recommendations.slice(0, 10)) {
      console.log(`- ${item}`);
    }
  }

  console.log("");
}

// Doel: gecombineerde pre-ticket review uitvoeren en zowel terminal- als bestandsoutput genereren
async function main() {
  const confluencePageId = process.argv[2];
  const figmaFileKey = process.argv[3];
  const figmaNodeId = process.argv[4];

  if (!confluencePageId) {
    throw new Error(
      "Use: pnpm exec tsx src/combinedRequirementsReview.ts <confluencePageId> [figmaFileKey] [figmaNodeId]",
    );
  }

  const orchestrator = new CombinedRequirementsReviewOrchestrator();

  const review = await orchestrator.evaluate({
    confluencePageId,
    figmaFileKey,
    figmaNodeId,
  });

  printCombinedRequirementsReview(review);

  const output = writeCombinedRequirementsReviewFiles({
    review,
    baseFileName: `combined-review-${confluencePageId}`,
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
