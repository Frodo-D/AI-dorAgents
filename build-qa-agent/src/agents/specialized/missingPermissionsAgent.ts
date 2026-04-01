import { openai } from "../../openai/client.js";
import type {
  MissingPermissionsAssessment,
  MissingPermissionsContext,
} from "../../types.js";
import { MissingPermissionsAssessmentSchema } from "../../schemas/missingPermissionsSchema.js";
import { loadPrompt } from "../../utils/promptLoader.js";

// Doel: gespecialiseerde agent die ontbrekende of inconsistente permissies analyseert op basis van Confluence en Figma
export class MissingPermissionsAgent {
  constructor(private readonly model = "gpt-5-nano") {}

  // Doel: permission coverage en permission consistency beoordelen
  async assess(
    context: MissingPermissionsContext,
  ): Promise<MissingPermissionsAssessment> {
    console.log("[MissingPermissionsAgent] gestart");

    const response = await openai.responses.create({
      model: this.model,
      instructions: loadPrompt("specialized/missing-permissions"),
      input: this.buildUserPrompt(context),
    });

    console.log("[MissingPermissionsAgent] response ontvangen");

    const text = response.output_text?.trim();
    console.log("[MissingPermissionsAgent] raw output:", text);

    if (!text) {
      throw new Error(
        "MissingPermissionsAgent: geen output ontvangen van model",
      );
    }

    try {
      const json = JSON.parse(text);
      const parsed = MissingPermissionsAssessmentSchema.parse(json);

      console.log(
        "[MissingPermissionsAgent] parsed missingPermissions:",
        parsed.missingPermissions.map((item) => ({
          text: item.text,
          evidenceCount: item.evidence.length,
        })),
      );

      console.log(
        "[MissingPermissionsAgent] parsed partiallyDefinedPermissions:",
        parsed.partiallyDefinedPermissions.map((item) => ({
          text: item.text,
          evidenceCount: item.evidence.length,
        })),
      );

      return parsed;
    } catch (error) {
      throw new Error(
        [
          "MissingPermissionsAgent: ongeldige output ontvangen.",
          "Ontvangen output:",
          text,
          `Technische fout: ${String(error)}`,
        ].join("\n\n"),
      );
    }
  }

  // Doel: model context geven voor een permission-focused review
  private buildUserPrompt(context: MissingPermissionsContext): string {
    return `
Beoordeel onderstaande requirements- en designcontext met focus op ontbrekende of inconsistente permissies en rolgedrag.

Context:
${JSON.stringify(context, null, 2)}
`;
  }
}
