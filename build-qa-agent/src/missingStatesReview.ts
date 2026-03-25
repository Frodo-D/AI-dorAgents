import { MissingStatesOrchestrator } from "./orchestrator/missingStatesOrchestrator.js";
import type { MissingStatesAssessment } from "./types.js";

// Doel: missing states review als compacte, menselijk leesbare tekst tonen in de terminal
function printMissingStatesResult(result: MissingStatesAssessment) {
  console.log("\nMissing states review");
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

  console.log("\nOntbrekende states:");
  if (result.missingStates.length === 0) {
    console.log("- Geen ontbrekende states gevonden");
  } else {
    for (const item of result.missingStates) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nGedeeltelijk uitgewerkte states:");
  if (result.partiallyDefinedStates.length === 0) {
    console.log("- Geen gedeeltelijk uitgewerkte states gevonden");
  } else {
    for (const item of result.partiallyDefinedStates) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nInconsistente states:");
  if (result.inconsistentStates.length === 0) {
    console.log("- Geen inconsistente states gevonden");
  } else {
    for (const item of result.inconsistentStates) {
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

// Doel: missing states review flow starten vanuit de CLI
async function main() {
  const confluencePageId = process.argv[2];
  const figmaFileKey = process.argv[3];
  const figmaNodeId = process.argv[4];

  if (!confluencePageId) {
    throw new Error(
      "Use: pnpm exec tsx src/missingStatesReview.ts <confluencePageId> [figmaFileKey] [figmaNodeId]",
    );
  }

  const orchestrator = new MissingStatesOrchestrator();

  const result = await orchestrator.evaluate({
    confluencePageId,
    figmaFileKey,
    figmaNodeId,
  });

  printMissingStatesResult(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});