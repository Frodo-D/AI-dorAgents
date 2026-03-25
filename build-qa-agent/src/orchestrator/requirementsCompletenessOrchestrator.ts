import { getConfluencePage } from "../connectors/confluence.js";
import { RequirementsCompletenessAgent } from "../agents/specialized/requirementsCompletenessAgent.js";
import type {
  RequirementsCompletenessAssessment,
  RequirementsCompletenessContext,
} from "../types.js";

// Doel: orchestrator voor Confluence-only requirements completeness review
export class RequirementsCompletenessOrchestrator {
  private readonly requirementsCompletenessAgent =
    new RequirementsCompletenessAgent();

  // Doel: Confluence ophalen en beoordelen op requirements volledigheid
  async evaluate(params: {
    confluencePageId: string;
  }): Promise<RequirementsCompletenessAssessment> {
    console.log("[RequirementsCompletenessOrchestrator] gestart");

    const context = await this.collectContext(params);
    console.log("[RequirementsCompletenessOrchestrator] context opgehaald");

    const result = await this.requirementsCompletenessAgent.assess(context);
    console.log("[RequirementsCompletenessOrchestrator] beoordeling klaar");

    return result;
  }

  // Doel: Confluence-only context opbouwen voor requirements review
  private async collectContext(params: {
    confluencePageId: string;
  }): Promise<RequirementsCompletenessContext> {
    const confluencePage = await getConfluencePage(params.confluencePageId);

    return {
      confluence: {
        title: confluencePage.title,
        body: confluencePage.body ?? "",
        url: confluencePage.url,
      },
    };
  }
}