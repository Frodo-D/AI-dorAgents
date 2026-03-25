import { openai } from "../../openai/client.js";
import type {
  MissingStatesAssessment,
  MissingStatesContext,
} from "../../types.js";
import { MissingStatesAssessmentSchema } from "../../schemas/missingStatesSchema.js";
import { loadPrompt } from "../../utils/promptLoader.js";

// Doel: gespecialiseerde agent die ontbrekende of inconsistente states analyseert op basis van Confluence en Figma
export class MissingStatesAgent {
  constructor(private readonly model = "gpt-5.2") {}

  // Doel: state coverage en state consistency beoordelen
  async assess(
    context: MissingStatesContext,
  ): Promise<MissingStatesAssessment> {
    console.log("[MissingStatesAgent] gestart");

    const response = await openai.responses.create({
      model: this.model,
      instructions: loadPrompt("specialized/missing-states"),
      input: this.buildUserPrompt(context),
    });

    console.log("[MissingStatesAgent] response ontvangen");

    const text = response.output_text?.trim();
    console.log("[MissingStatesAgent] raw output:", text);

    if (!text) {
      throw new Error("MissingStatesAgent: geen output ontvangen van model");
    }

    try {
      const json = JSON.parse(text);
      return MissingStatesAssessmentSchema.parse(json);
    } catch (error) {
      throw new Error(
        [
          "MissingStatesAgent: ongeldige output ontvangen.",
          "Ontvangen output:",
          text,
          `Technische fout: ${String(error)}`,
        ].join("\n\n"),
      );
    }
  }

  // Doel: model context geven voor een state-focused review
  private buildUserPrompt(context: MissingStatesContext): string {
    return `
Beoordeel onderstaande requirements- en designcontext met focus op ontbrekende of inconsistente states.

Context:
${JSON.stringify(context, null, 2)}
`;
  }
}