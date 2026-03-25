import { MissingValidationsOrchestrator } from "./orchestrator/missingValidationsOrchestrator.js";
import type { MissingValidationsAssessment } from "./types.js";

// Doel: missing validations review als compacte, menselijk leesbare tekst tonen in de terminal
function printMissingValidationsResult(
  result: MissingValidationsAssessment,
) {
  console.log("\nMissing validations review");
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

  console.log("\nOntbrekende validaties:");
  if (result.missingValidations.length === 0) {
    console.log("- Geen ontbrekende validaties gevonden");
  } else {
    for (const item of result.missingValidations) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nGedeeltelijk uitgewerkte validaties:");
  if (result.partiallyDefinedValidations.length === 0) {
    console.log("- Geen gedeeltelijk uitgewerkte validaties gevonden");
  } else {
    for (const item of result.partiallyDefinedValidations) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nInconsistente validaties:");
  if (result.inconsistentValidations.length === 0) {
    console.log("- Geen inconsistente validaties gevonden");
  } else {
    for (const item of result.inconsistentValidations) {
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

// Doel: missing validations review flow starten vanuit de CLI
async function main() {
  const confluencePageId = process.argv[2];
  const figmaFileKey = process.argv[3];
  const figmaNodeId = process.argv[4];

  if (!confluencePageId) {
    throw new Error(
      "Use: pnpm exec tsx src/missingValidationsReview.ts <confluencePageId> [figmaFileKey] [figmaNodeId]",
    );
  }

  const orchestrator = new MissingValidationsOrchestrator();

  const result = await orchestrator.evaluate({
    confluencePageId,
    figmaFileKey,
    figmaNodeId,
  });

  printMissingValidationsResult(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});