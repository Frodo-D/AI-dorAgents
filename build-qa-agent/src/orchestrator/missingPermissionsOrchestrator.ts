import { getConfluencePage } from "../connectors/confluence.js";
import { getFigmaFile, getFigmaNode } from "../connectors/figma.js";
import { MissingPermissionsAgent } from "../agents/specialized/missingPermissionsAgent.js";
import type {
  MissingPermissionsAssessment,
  MissingPermissionsContext,
} from "../types.js";

// Doel: orchestrator voor permission-focused review op basis van Confluence en Figma
export class MissingPermissionsOrchestrator {
  private readonly missingPermissionsAgent = new MissingPermissionsAgent();

  // Doel: Confluence en Figma ophalen en laten beoordelen op ontbrekende permissies
  async evaluate(params: {
    confluencePageId: string;
    figmaFileKey?: string;
    figmaNodeId?: string;
  }): Promise<MissingPermissionsAssessment> {
    console.log("[MissingPermissionsOrchestrator] gestart");

    const context = await this.collectContext(params);
    console.log("[MissingPermissionsOrchestrator] context opgehaald");

    const result = await this.missingPermissionsAgent.assess(context);
    console.log("[MissingPermissionsOrchestrator] beoordeling klaar");

    return result;
  }

  // Doel: reviewcontext opbouwen uit Confluence en Figma
  private async collectContext(params: {
    confluencePageId: string;
    figmaFileKey?: string;
    figmaNodeId?: string;
  }): Promise<MissingPermissionsContext> {
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
