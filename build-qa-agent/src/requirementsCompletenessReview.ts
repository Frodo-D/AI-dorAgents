import { RequirementsCompletenessOrchestrator } from "./orchestrator/requirementsCompletenessOrchestrator.js";
import type { RequirementsCompletenessAssessment } from "./types.js";

// Doel: requirements completeness review als compacte, menselijk leesbare tekst tonen in de terminal
function printRequirementsCompletenessResult(
  result: RequirementsCompletenessAssessment,
) {
  console.log("\nRequirements completeness review");
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

  console.log("\nHiaten:");
  if (result.gaps.length === 0) {
    console.log("- Geen hiaten gevonden");
  } else {
    for (const item of result.gaps) {
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

  console.log("\nOntbrekende validaties:");
  if (result.missingValidations.length === 0) {
    console.log("- Geen ontbrekende validaties gevonden");
  } else {
    for (const item of result.missingValidations) {
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

// Doel: Confluence-only requirements review starten vanuit de CLI
async function main() {
  const confluencePageId = process.argv[2];

  if (!confluencePageId) {
    throw new Error(
      "Use: pnpm exec tsx src/requirementsCompletenessReview.ts <confluencePageId>",
    );
  }

  const orchestrator = new RequirementsCompletenessOrchestrator();

  const result = await orchestrator.evaluate({
    confluencePageId,
  });

  printRequirementsCompletenessResult(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});