import { JiraDorOrchestrator } from "./orchestrator/jiraDorOrchestrator.js";
import type { FinalDorAssessment } from "./types.js";

// Doel: testscenario's groeperen op basis van testSuite voor leesbare output
function groupScenariosBySuite(
  scenarios: NonNullable<FinalDorAssessment["testScenarios"]>,
) {
  return {
    smoke: scenarios.filter((item) => item.testSuite === "smoke"),
    regression: scenarios.filter((item) => item.testSuite === "regression"),
    exploratory_follow_up: scenarios.filter(
      (item) => item.testSuite === "exploratory_follow_up",
    ),
    unclassified: scenarios.filter((item) => !item.testSuite),
  };
}

// Doel: testscenario's sorteren op prioriteit zodat high eerst komt, daarna medium en low
function sortScenariosByPriority(
  scenarios: NonNullable<FinalDorAssessment["testScenarios"]>,
) {
  const priorityOrder = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return [...scenarios].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  );
}

// Doel: eindbeoordeling als compacte, menselijk leesbare tekst tonen in de terminal
function printReadableResult(result: FinalDorAssessment) {
  console.log(`\nTicket: ${result.ticketKey}`);
  console.log(`Status: ${result.overallStatus}\n`);

  console.log("Samenvatting:");
  console.log(result.executiveSummary);

  if (result.riskScore !== undefined) {
    console.log(`\nRisico: ${result.riskScore}/10`);
    if (result.riskReason) {
      console.log(`Reden: ${result.riskReason}`);
    }
  }

  console.log("\nSterke punten:");
  const strengths = result.strengths.slice(0, 3);
  if (strengths.length === 0) {
    console.log("- Geen expliciete sterke punten gevonden");
  } else {
    for (const item of strengths) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nBelangrijkste hiaten:");
  const gaps = result.gaps.slice(0, 5);
  if (gaps.length === 0) {
    console.log("- Geen kritieke hiaten gevonden");
  } else {
    for (const item of gaps) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nAanbevolen acties:");
  const actions = result.recommendedActions.slice(0, 5);
  if (actions.length === 0) {
    console.log("- Geen aanvullende acties nodig");
  } else {
    for (const item of actions) {
      console.log(`- ${item}`);
    }
  }

  console.log("\nTestsuggesties:");
  const scenarios = result.testScenarios?.slice(0, 8) ?? [];

  if (scenarios.length === 0) {
    console.log("- Geen testscenario's gevonden");
  } else {
    const grouped = groupScenariosBySuite(scenarios);

    // Doel: één groep testscenario's in consistente en op prioriteit gesorteerde vorm printen
    const printScenarioGroup = (
      title: string,
      items: typeof scenarios,
    ) => {
      if (items.length === 0) return;

      console.log(`\n${title}:`);

      const sortedItems = sortScenariosByPriority(items);

      for (const item of sortedItems) {
        console.log(
          `- ${item.title} [${item.type}, prioriteit: ${item.priority}]`,
        );

        console.log(`  Verwacht resultaat: ${item.expectedResult}`);
        console.log(
          `  Automation candidate: ${item.automationCandidate ? "ja" : "nee"}`,
        );

        if (item.automationCandidateReason) {
          console.log(`  Reden automation: ${item.automationCandidateReason}`);
        }

        if (item.preconditions && item.preconditions.length > 0) {
          console.log(`  Preconditions: ${item.preconditions.join(", ")}`);
        }

        if (item.testData && item.testData.length > 0) {
          console.log(`  Testdata: ${item.testData.join(", ")}`);
        }

        if (item.notes) {
          console.log(`  Notes: ${item.notes}`);
        }

        if (item.screenHint) {
          console.log(`  Scherm: ${item.screenHint}`);
        }
      }
    };

    printScenarioGroup("Smoke", grouped.smoke);
    printScenarioGroup("Regression", grouped.regression);
    printScenarioGroup("Exploratory follow-up", grouped.exploratory_follow_up);
    printScenarioGroup("Overig", grouped.unclassified);
  }

  console.log("");
}

// Doel: CLI entrypoint dat een Jira ticket beoordeelt en leesbaar toont
async function main() {
  console.log("[main] gestart");

  const issueKey = process.argv[2];
  console.log("[main] issueKey:", issueKey);

  if (!issueKey) {
    throw new Error("Use: pnpm run dev APP-123");
  }

  const orchestrator = new JiraDorOrchestrator();
  console.log("[main] orchestrator aangemaakt");

  const result = await orchestrator.evaluateFromJiraKey(issueKey);
  console.log("[main] resultaat ontvangen");

  printReadableResult(result);
}

// Doel: start de applicatie en vangt fouten centraal af
main().catch((error) => {
  console.error(error);
  process.exit(1);
});