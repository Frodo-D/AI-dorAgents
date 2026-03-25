import { openai } from "../../openai/client.js";
import type {
  MissingValidationsAssessment,
  MissingValidationsContext,
} from "../../types.js";
import { MissingValidationsAssessmentSchema } from "../../schemas/missingValidationsSchema.js";
import { loadPrompt } from "../../utils/promptLoader.js";

// Doel: gespecialiseerde agent die ontbrekende of inconsistente validaties analyseert op basis van Confluence en Figma
export class MissingValidationsAgent {
  constructor(private readonly model = "gpt-5.2") {}

  // Doel: validation coverage en validation consistency beoordelen
  async assess(
    context: MissingValidationsContext,
  ): Promise<MissingValidationsAssessment> {
    console.log("[MissingValidationsAgent] gestart");

    const response = await openai.responses.create({
      model: this.model,
      instructions: loadPrompt("specialized/missing-validations"),
      input: this.buildUserPrompt(context),
    });

    console.log("[MissingValidationsAgent] response ontvangen");

    const text = response.output_text?.trim();
    console.log("[MissingValidationsAgent] raw output:", text);

    if (!text) {
      throw new Error(
        "MissingValidationsAgent: geen output ontvangen van model",
      );
    }

    try {
      const json = JSON.parse(text);
      return MissingValidationsAssessmentSchema.parse(json);
    } catch (error) {
      throw new Error(
        [
          "MissingValidationsAgent: ongeldige output ontvangen.",
          "Ontvangen output:",
          text,
          `Technische fout: ${String(error)}`,
        ].join("\n\n"),
      );
    }
  }

  // Doel: model context geven voor een validation-focused review
  private buildUserPrompt(context: MissingValidationsContext): string {
    return `
Beoordeel onderstaande requirements- en designcontext met focus op ontbrekende of inconsistente validaties.

Context:
${JSON.stringify(context, null, 2)}
`;
  }
}