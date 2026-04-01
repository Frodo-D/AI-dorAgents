import { RequirementsReviewOrchestrator } from "../orchestrator/requirementsReviewOrchestrator.js";
import { RequirementsAlignmentAssessment } from "../types.js";

// Doel: requirements review resultaat leesbaar tonen in de terminal
function printRequirementsReviewResult(
  result: RequirementsAlignmentAssessment,
) {
  console.log("\n==============================");
  console.log("REQUIREMENTS REVIEW");
  console.log("==============================\n");

  console.log(`Status: ${result.overallStatus}\n`);

  console.log("Samenvatting:");
  console.log(result.summary);

  console.log("\nSterke punten:");
  if (result.strengths.length === 0) {
    console.log("- Geen expliciete sterke punten gevonden");
  } else {
    for (const item of result.strengths.slice(0, 5)) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nBelangrijkste hiaten:");
  if (result.gaps.length === 0) {
    console.log("- Geen kritieke hiaten gevonden");
  } else {
    for (const item of result.gaps.slice(0, 5)) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nOpen vragen:");
  if (result.openQuestions.length === 0) {
    console.log("- Geen open vragen");
  } else {
    for (const item of result.openQuestions.slice(0, 5)) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nAanbevelingen:");
  if (result.recommendations.length === 0) {
    console.log("- Geen aanvullende aanbevelingen");
  } else {
    for (const item of result.recommendations.slice(0, 5)) {
      console.log(`- ${item}`);
    }
  }

  console.log("\n");
}

// Doel: requirements review flow handmatig starten voor Confluence + Figma
async function main() {
  const confluencePageId = process.argv[2];
  const figmaFileKey = process.argv[3];
  const figmaNodeId = process.argv[4];

  if (!confluencePageId) {
    throw new Error(
      "Use: pnpm exec tsx src/requirementsReview.ts <confluencePageId> [figmaFileKey] [figmaNodeId]",
    );
  }

  const orchestrator = new RequirementsReviewOrchestrator();

  const result = await orchestrator.evaluate({
    confluencePageId,
    figmaFileKey,
    figmaNodeId,
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
