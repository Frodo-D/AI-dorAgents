import { getConfluencePage } from "../connectors/confluence.js";
import { getFigmaFile, getFigmaNode } from "../connectors/figma.js";
import { RequirementsAlignmentAgent } from "../agents/specialized/requirementsAlignmentAgent.js";
import type {
  RequirementsAlignmentAssessment,
  RequirementsReviewContext,
} from "../types.js";

// Doel: orchestrator voor requirements review vóór Jira ticketcreatie
export class RequirementsReviewOrchestrator {
  private readonly requirementsAlignmentAgent = new RequirementsAlignmentAgent();

  // Doel: Confluence en Figma context ophalen en laten beoordelen op alignment
  async evaluate(params: {
    confluencePageId: string;
    figmaFileKey?: string;
    figmaNodeId?: string;
  }): Promise<RequirementsAlignmentAssessment> {
    console.log("[RequirementsReviewOrchestrator] gestart");

    const context = await this.collectContext(params);
    console.log("[RequirementsReviewOrchestrator] context opgehaald");

    const result = await this.requirementsAlignmentAgent.assess(context);
    console.log("[RequirementsReviewOrchestrator] beoordeling klaar");

    return result;
  }

  // Doel: reviewcontext opbouwen uit Confluence en Figma
  private async collectContext(params: {
    confluencePageId: string;
    figmaFileKey?: string;
    figmaNodeId?: string;
  }): Promise<RequirementsReviewContext> {
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