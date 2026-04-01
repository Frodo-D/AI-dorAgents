import { getConfluencePage } from "../connectors/confluence.js";
import { getFigmaFile, getFigmaNode } from "../connectors/figma.js";
import { MissingValidationsAgent } from "../agents/specialized/missingValidationsAgent.js";
import type {
  MissingValidationsAssessment,
  MissingValidationsContext,
} from "../types.js";

// Doel: orchestrator voor validation-focused review op basis van Confluence en Figma
export class MissingValidationsOrchestrator {
  private readonly missingValidationsAgent = new MissingValidationsAgent();

  // Doel: Confluence en Figma ophalen en laten beoordelen op ontbrekende validaties
  async evaluate(params: {
    confluencePageId: string;
    figmaFileKey?: string;
    figmaNodeId?: string;
  }): Promise<MissingValidationsAssessment> {
    console.log("[MissingValidationsOrchestrator] gestart");

    const context = await this.collectContext(params);
    console.log("[MissingValidationsOrchestrator] context opgehaald");

    const result = await this.missingValidationsAgent.assess(context);
    console.log("[MissingValidationsOrchestrator] beoordeling klaar");

    return result;
  }

  // Doel: reviewcontext opbouwen uit Confluence en Figma
  private async collectContext(params: {
    confluencePageId: string;
    figmaFileKey?: string;
    figmaNodeId?: string;
  }): Promise<MissingValidationsContext> {
    const confluencePage = await getConfluencePage(params.confluencePageId);

    const figma = [];

    if (params.figmaFileKey && params.figmaNodeId) {
      figma.push(await getFigmaNode(params.figmaFileKey, params.figmaNodeId));
    } else if (params.figmaFileKey) {
      figma.push(await getFigmaFile(params.figmaFileKey));
    }

    return {
      confluence: {
        title: confluencePage.title,
        body: confluencePage.body ?? "",
        url: confluencePage.url,
      },
      figma,
    };
  }
}
