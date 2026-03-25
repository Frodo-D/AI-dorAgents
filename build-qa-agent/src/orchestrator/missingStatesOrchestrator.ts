import { getConfluencePage } from "../connectors/confluence.js";
import { getFigmaFile, getFigmaNode } from "../connectors/figma.js";
import { MissingStatesAgent } from "../agents/specialized/missingStatesAgent.js";
import type {
  MissingStatesAssessment,
  MissingStatesContext,
} from "../types.js";

// Doel: orchestrator voor state-focused review op basis van Confluence en Figma
export class MissingStatesOrchestrator {
  private readonly missingStatesAgent = new MissingStatesAgent();

  // Doel: Confluence en Figma ophalen en laten beoordelen op ontbrekende states
  async evaluate(params: {
    confluencePageId: string;
    figmaFileKey?: string;
    figmaNodeId?: string;
  }): Promise<MissingStatesAssessment> {
    console.log("[MissingStatesOrchestrator] gestart");

    const context = await this.collectContext(params);
    console.log("[MissingStatesOrchestrator] context opgehaald");

    const result = await this.missingStatesAgent.assess(context);
    console.log("[MissingStatesOrchestrator] beoordeling klaar");

    return result;
  }

  // Doel: reviewcontext opbouwen uit Confluence en Figma
  private async collectContext(params: {
    confluencePageId: string;
    figmaFileKey?: string;
    figmaNodeId?: string;
  }): Promise<MissingStatesContext> {
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