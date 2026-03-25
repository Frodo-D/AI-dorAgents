import { openai } from "../../openai/client.js";
import type {
  RequirementsCompletenessAssessment,
  RequirementsCompletenessContext,
} from "../../types.js";
import { RequirementsCompletenessAssessmentSchema } from "../../schemas/requirementsCompletenessSchema.js";
import { loadPrompt } from "../../utils/promptLoader.js";

// Doel: gespecialiseerde agent die alleen de volledigheid van Confluence requirements beoordeelt
export class RequirementsCompletenessAgent {
  constructor(private readonly model = "gpt-5.4-nano") {}

  // Doel: Confluence requirements beoordelen op volledigheid en bruikbaarheid
  async assess(
    context: RequirementsCompletenessContext,
  ): Promise<RequirementsCompletenessAssessment> {
    console.log("[RequirementsCompletenessAgent] gestart");

    const response = await openai.responses.create({
      model: this.model,
      instructions: loadPrompt("specialized/requirements-completeness"),
      input: this.buildUserPrompt(context),
    });

    console.log("[RequirementsCompletenessAgent] response ontvangen");

    const text = response.output_text?.trim();
    console.log("[RequirementsCompletenessAgent] raw output:", text);

    if (!text) {
      throw new Error(
        "RequirementsCompletenessAgent: geen output ontvangen van model",
      );
    }

    try {
      const json = JSON.parse(text);
      return RequirementsCompletenessAssessmentSchema.parse(json);
    } catch (error) {
      throw new Error(
        [
          "RequirementsCompletenessAgent: ongeldige output ontvangen.",
          "Ontvangen output:",
          text,
          `Technische fout: ${String(error)}`,
        ].join("\n\n"),
      );
    }
  }

  // Doel: model context geven voor een requirements-only review
  private buildUserPrompt(context: RequirementsCompletenessContext): string {
    return `
Beoordeel onderstaande Confluence requirements op volledigheid.

Context:
${JSON.stringify(context, null, 2)}
`;
  }
}