import { openai } from "../../openai/client.js";
import type { DorEvaluationContext, TestScenario } from "../../types.js";
import { TestScenarioListSchema } from "../../schemas/testScenarioSchema.js";
import { loadPrompt } from "../../utils/promptLoader.js";

// Doel: op basis van vaste regels bepalen of een testscenario geschikt is voor automatisering
function determineAutomationCandidate(scenario: TestScenario): boolean {
  const title = scenario.title.toLowerCase();
  const expectedResult = scenario.expectedResult.toLowerCase();
  const notes = scenario.notes?.toLowerCase() ?? "";

  // Visuele of subjectieve checks liever niet automatisch
  if (
    title.includes("layout") ||
    title.includes("visueel") ||
    title.includes("design") ||
    title.includes("responsive") ||
    notes.includes("handmatig beoordelen") ||
    notes.includes("visuele controle")
  ) {
    return false;
  }

  // Edge cases alleen automatiseren als ze voldoende waarde hebben
  if (scenario.type === "edge_case" && scenario.priority === "low") {
    return false;
  }

  // Happy flow, validation, negative en permission zijn vaak goede kandidaten
  if (
    scenario.type === "happy_flow" ||
    scenario.type === "validation" ||
    scenario.type === "negative" ||
    scenario.type === "permission"
  ) {
    return true;
  }

  // Als expected result te vaag is, liever niet automatiseren
  if (
    expectedResult.includes("ziet er goed uit") ||
    expectedResult.includes("correct weergegeven") ||
    expectedResult.includes("gebruiksvriendelijk")
  ) {
    return false;
  }

  return scenario.automationCandidate;
}
// Doel: uitleg geven waarom een scenario wel of niet als automation candidate is gemarkeerd
function determineAutomationCandidateReason(scenario: TestScenario): string {
  const title = scenario.title.toLowerCase();
  const expectedResult = scenario.expectedResult.toLowerCase();
  const notes = scenario.notes?.toLowerCase() ?? "";

  if (
    title.includes("layout") ||
    title.includes("visueel") ||
    title.includes("design") ||
    title.includes("responsive") ||
    notes.includes("handmatig beoordelen") ||
    notes.includes("visuele controle")
  ) {
    return "Scenario vraagt visuele of subjectieve beoordeling en is daarom minder geschikt voor automatisering";
  }

  if (scenario.type === "edge_case" && scenario.priority === "low") {
    return "Scenario is een edge case met lage prioriteit en beperkte automatiseringswaarde";
  }

  if (
    scenario.type === "happy_flow" ||
    scenario.type === "validation" ||
    scenario.type === "negative" ||
    scenario.type === "permission"
  ) {
    return "Scenario is stabiel, herhaalbaar en heeft een duidelijk verifieerbaar resultaat";
  }

  if (
    expectedResult.includes("ziet er goed uit") ||
    expectedResult.includes("correct weergegeven") ||
    expectedResult.includes("gebruiksvriendelijk")
  ) {
    return "Expected result is te subjectief geformuleerd voor betrouwbare automatisering";
  }

  return scenario.automationCandidate
    ? "Scenario lijkt geschikt voor automatisering op basis van de beschikbare context"
    : "Scenario lijkt minder geschikt voor automatisering op basis van de beschikbare context";
}

// Doel: scenario automatisch indelen in smoke, regression of exploratory follow-up
function determineTestSuite(scenario: TestScenario): "smoke" | "regression" | "exploratory_follow_up" {
  const title = scenario.title.toLowerCase();
  const notes = scenario.notes?.toLowerCase() ?? "";

  // Exploratory follow-up voor visuele, subjectieve of onzekere scenario's
  if (
    title.includes("visueel") ||
    title.includes("design") ||
    title.includes("responsive") ||
    notes.includes("onduidelijk") ||
    notes.includes("handmatig beoordelen")
  ) {
    return "exploratory_follow_up";
  }

  // Smoke voor kernfunctionaliteit met hoge prioriteit
  if (
    scenario.priority === "high" &&
    (scenario.type === "happy_flow" || scenario.type === "permission")
  ) {
    return "smoke";
  }

  // Validatie en negatieve paden meestal regression
  if (
    scenario.type === "validation" ||
    scenario.type === "negative" ||
    scenario.type === "edge_case"
  ) {
    return "regression";
  }

  return "regression";
}

// Doel: gespecialiseerde agent die gestructureerde testscenario's genereert
export class TestScenarioAgent {
  constructor(private readonly model = "gpt-5.4-nano") {}

  // Doel: op basis van context een lijst met gestructureerde testscenario's genereren en valideren
  async assess(context: DorEvaluationContext): Promise<TestScenario[]> {
    console.log("[TestScenarioAgent] gestart");

    const response = await openai.responses.create({
      model: this.model,
      instructions: loadPrompt("/specialized/test-scenario"),
      input: this.buildUserPrompt(context),
    });

    console.log("[TestScenarioAgent] response ontvangen");

    const text = response.output_text?.trim();
    console.log("[TestScenarioAgent] raw output:", text);

    if (!text) {
      throw new Error("Test Scenario Agent: geen output ontvangen van model");
    }

    try {
      const json = JSON.parse(text);
            const parsed = TestScenarioListSchema.parse(json);

      // Doel: automationCandidate, reden en testSuite consistent maken op basis van vaste regels
      const normalized = parsed.map((scenario) => {
        const automationCandidate = determineAutomationCandidate(scenario);

        return {
          ...scenario,
          automationCandidate,
          automationCandidateReason: determineAutomationCandidateReason({
            ...scenario,
            automationCandidate,
          }),
          testSuite: determineTestSuite({
            ...scenario,
            automationCandidate,
          }),
        };
      });

      console.log("[TestScenarioAgent] validatie gelukt");
      return normalized;
    } catch (error) {
      throw new Error(
        [
          "Test Scenario Agent: ongeldige output ontvangen.",
          "Ontvangen output:",
          text,
          `Technische fout: ${String(error)}`,
        ].join("\n\n")
      );
    }
  }

  // Doel: model instrueren om alleen een JSON array met testscenario-objecten terug te geven
  private buildUserPrompt(context: DorEvaluationContext): string {
    return `
Genereer testscenario's op basis van onderstaande context.

Geef ALLEEN geldige JSON terug in exact deze vorm:
[
  {
    "title": "string",
    "type": "happy_flow | negative | validation | permission | edge_case",
    "priority": "low | medium | high",
    "expectedResult": "string",
    "automationCandidate": true,
    "preconditions": ["string"],
    "testData": ["string"],
    "notes": "string",
    "screenHint": "string"
  }
]

Context:
${JSON.stringify(context, null, 2)}
`;
  }
}