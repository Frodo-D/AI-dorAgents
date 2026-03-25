import { RequirementsReviewOrchestrator } from "./orchestrator/requirementsReviewOrchestrator.js";
import type { RequirementsAlignmentAssessment } from "./types.js";

// Doel: requirements alignment review als compacte, menselijk leesbare tekst tonen in de terminal
function printRequirementsReviewResult(
  result: RequirementsAlignmentAssessment,
) {
  console.log("\nRequirements alignment review");
  console.log(`Status: ${result.overallStatus}\n`);

  console.log("Samenvatting:");
  console.log(result.summary);

  console.log("\nSterke punten:");
  if (result.strengths.length === 0) {
    console.log("- Geen expliciete sterke punten gevonden");
  } else {
    for (const item of result.strengths) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nBelangrijkste alignment-hiaten:");
  if (result.gaps.length === 0) {
    console.log("- Geen alignment-hiaten gevonden");
  } else {
    for (const item of result.gaps) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nRequirements niet zichtbaar in design:");
  if (result.requirementsNotRepresentedInDesign.length === 0) {
    console.log("- Geen ontbrekende requirement-uitwerkingen gevonden");
  } else {
    for (const item of result.requirementsNotRepresentedInDesign) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nDesign-elementen zonder requirementbasis:");
  if (result.designElementsWithoutRequirementBasis.length === 0) {
    console.log("- Geen design-elementen zonder requirementbasis gevonden");
  } else {
    for (const item of result.designElementsWithoutRequirementBasis) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nTegenstrijdigheden:");
  if (result.contradictions.length === 0) {
    console.log("- Geen tegenstrijdigheden gevonden");
  } else {
    for (const item of result.contradictions) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nOpen vragen:");
  if (result.openQuestions.length === 0) {
    console.log("- Geen open vragen");
  } else {
    for (const item of result.openQuestions) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nAanbevelingen:");
  if (result.recommendations.length === 0) {
    console.log("- Geen aanvullende aanbevelingen");
  } else {
    for (const item of result.recommendations) {
      console.log(`- ${item}`);
    }
  }

  console.log("");
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

  printRequirementsReviewResult(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});