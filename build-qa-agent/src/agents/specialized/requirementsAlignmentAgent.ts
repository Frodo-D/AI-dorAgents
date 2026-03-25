import { openai } from "../../openai/client.js";
import type {
  RequirementsAlignmentAssessment,
  RequirementsReviewContext,
} from "../../types.js";
import { RequirementsAlignmentAssessmentSchema } from "../../schemas/requirementsAlignmentSchema.js";
import { loadPrompt } from "../../utils/promptLoader.js";

// Doel: gespecialiseerde agent die requirements uit Confluence vergelijkt met de uitwerking in Figma
export class RequirementsAlignmentAgent {
  constructor(private readonly model = "gpt-5.4-nano") {}

  // Doel: requirements en design vergelijken en een gestructureerde alignment review teruggeven
  async assess(
    context: RequirementsReviewContext,
  ): Promise<RequirementsAlignmentAssessment> {
    console.log("[RequirementsAlignmentAgent] gestart");

    const response = await openai.responses.create({
      model: this.model,
      instructions: loadPrompt("/specialized/requirements-alignment"),
      input: this.buildUserPrompt(context),
    });

    console.log("[RequirementsAlignmentAgent] response ontvangen");

    const text = response.output_text?.trim();
    console.log("[RequirementsAlignmentAgent] raw output:", text);

    if (!text) {
      throw new Error(
        "RequirementsAlignmentAgent: geen output ontvangen van model",
      );
    }

    try {
      const json = JSON.parse(text);
      return RequirementsAlignmentAssessmentSchema.parse(json);
    } catch (error) {
      throw new Error(
        [
          "RequirementsAlignmentAgent: ongeldige output ontvangen.",
          "Ontvangen output:",
          text,
          `Technische fout: ${String(error)}`,
        ].join("\n\n"),
      );
    }
  }

  // Doel: model instrueren om alleen de gewenste gestructureerde review terug te geven
  private buildUserPrompt(context: RequirementsReviewContext): string {
    return `
Beoordeel onderstaande requirements-context.

Context:
${JSON.stringify(context, null, 2)}
`;
  }
}