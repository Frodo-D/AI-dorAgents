import { MissingPermissionsOrchestrator } from "./orchestrator/missingPermissionsOrchestrator.js";
import type { MissingPermissionsAssessment } from "./types.js";

// Doel: missing permissions review als compacte, menselijk leesbare tekst tonen in de terminal
function printMissingPermissionsResult(result: MissingPermissionsAssessment) {
  console.log("\nMissing permissions review");
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

  console.log("\nOntbrekende permissies:");
  if (result.missingPermissions.length === 0) {
    console.log("- Geen ontbrekende permissies gevonden");
  } else {
    for (const item of result.missingPermissions) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nGedeeltelijk uitgewerkte permissies:");
  if (result.partiallyDefinedPermissions.length === 0) {
    console.log("- Geen gedeeltelijk uitgewerkte permissies gevonden");
  } else {
    for (const item of result.partiallyDefinedPermissions) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nInconsistente permissies:");
  if (result.inconsistentPermissions.length === 0) {
    console.log("- Geen inconsistente permissies gevonden");
  } else {
    for (const item of result.inconsistentPermissions) {
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

// Doel: missing permissions review flow starten vanuit de CLI
async function main() {
  const confluencePageId = process.argv[2];
  const figmaFileKey = process.argv[3];
  const figmaNodeId = process.argv[4];

  if (!confluencePageId) {
    throw new Error(
      "Use: pnpm exec tsx src/missingPermissionsReview.ts <confluencePageId> [figmaFileKey] [figmaNodeId]",
    );
  }

  const orchestrator = new MissingPermissionsOrchestrator();

  const result = await orchestrator.evaluate({
    confluencePageId,
    figmaFileKey,
    figmaNodeId,
  });

  printMissingPermissionsResult(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
