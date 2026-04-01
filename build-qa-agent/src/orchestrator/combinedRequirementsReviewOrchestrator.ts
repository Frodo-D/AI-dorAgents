import { CombinedRequirementsReviewSchema } from "../schemas/combinedRequirementsReviewSchema.js";
import { RequirementsCompletenessOrchestrator } from "./requirementsCompletenessOrchestrator.js";
import { RequirementsReviewOrchestrator } from "./requirementsReviewOrchestrator.js";
import { MissingStatesOrchestrator } from "./missingStatesOrchestrator.js";
import { MissingValidationsOrchestrator } from "./missingValidationsOrchestrator.js";
import { MissingPermissionsOrchestrator } from "./missingPermissionsOrchestrator.js";
import type { CombinedRequirementsReview } from "../types.js";

// Doel: meerdere pre-ticket review flows combineren tot één totale beoordeling
export class CombinedRequirementsReviewOrchestrator {
  private readonly completenessOrchestrator =
    new RequirementsCompletenessOrchestrator();

  private readonly alignmentOrchestrator = new RequirementsReviewOrchestrator();

  private readonly missingStatesOrchestrator = new MissingStatesOrchestrator();

  private readonly missingValidationsOrchestrator =
    new MissingValidationsOrchestrator();

  private readonly missingPermissionsOrchestrator =
    new MissingPermissionsOrchestrator();

  // Doel: volledige gecombineerde pre-ticket review uitvoeren
  async evaluate(params: {
    confluencePageId: string;
    figmaFileKey?: string;
    figmaNodeId?: string;
  }): Promise<CombinedRequirementsReview> {
    const [
      completeness,
      alignment,
      missingStates,
      missingValidations,
      missingPermissions,
    ] = await Promise.all([
      this.completenessOrchestrator.evaluate({
        confluencePageId: params.confluencePageId,
      }),
      this.alignmentOrchestrator.evaluate({
        confluencePageId: params.confluencePageId,
        figmaFileKey: params.figmaFileKey,
        figmaNodeId: params.figmaNodeId,
      }),
      this.missingStatesOrchestrator.evaluate({
        confluencePageId: params.confluencePageId,
        figmaFileKey: params.figmaFileKey,
        figmaNodeId: params.figmaNodeId,
      }),
      this.missingValidationsOrchestrator.evaluate({
        confluencePageId: params.confluencePageId,
        figmaFileKey: params.figmaFileKey,
        figmaNodeId: params.figmaNodeId,
      }),
      this.missingPermissionsOrchestrator.evaluate({
        confluencePageId: params.confluencePageId,
        figmaFileKey: params.figmaFileKey,
        figmaNodeId: params.figmaNodeId,
      }),
    ]);

    const keyRisks = [
      ...completeness.gaps.slice(0, 2),
      ...alignment.gaps.slice(0, 2),
      ...missingStates.missingStates.slice(0, 2),
      ...missingValidations.missingValidations.slice(0, 2),
      ...missingPermissions.missingPermissions.slice(0, 2),
    ].filter(Boolean);

    const recommendations = [
      ...completeness.recommendations,
      ...alignment.recommendations,
      ...missingStates.recommendations,
      ...missingValidations.recommendations,
      ...missingPermissions.recommendations,
    ].filter(Boolean);

    const overallStatus = this.determineOverallStatus({
      completeness,
      alignment,
      missingStates,
      missingValidations,
      missingPermissions,
    });

    const executiveSummary = this.buildExecutiveSummary({
      overallStatus,
      completeness,
      alignment,
      missingStates,
      missingValidations,
      missingPermissions,
    });

    const result = {
      executiveSummary,
      overallStatus,
      keyRisks: dedupe(keyRisks),
      recommendations: dedupe(recommendations),
      completeness,
      alignment,
      missingStates,
      missingValidations,
      missingPermissions,
    };

    return CombinedRequirementsReviewSchema.parse(result);
  }

  // Doel: gecombineerde readiness bepalen op basis van de onderliggende reviews
  private determineOverallStatus(input: {
    completeness: CombinedRequirementsReview["completeness"];
    alignment: CombinedRequirementsReview["alignment"];
    missingStates: CombinedRequirementsReview["missingStates"];
    missingValidations: CombinedRequirementsReview["missingValidations"];
    missingPermissions: CombinedRequirementsReview["missingPermissions"];
  }): CombinedRequirementsReview["overallStatus"] {
    const severeSignals =
      input.completeness.overallStatus === "INCOMPLETE" ||
      input.alignment.overallStatus === "NOT_ALIGNED" ||
      input.missingStates.overallStatus === "STATE_COVERAGE_POOR" ||
      input.missingValidations.overallStatus === "VALIDATION_COVERAGE_POOR" ||
      input.missingPermissions.overallStatus === "PERMISSION_COVERAGE_POOR";

    if (severeSignals) {
      return "NOT_READY_FOR_TICKET_CREATION";
    }

    const partialSignals =
      input.completeness.overallStatus === "PARTIALLY_COMPLETE" ||
      input.alignment.overallStatus === "PARTIALLY_ALIGNED" ||
      input.missingStates.overallStatus === "STATE_COVERAGE_PARTIAL" ||
      input.missingValidations.overallStatus ===
        "VALIDATION_COVERAGE_PARTIAL" ||
      input.missingPermissions.overallStatus === "PERMISSION_COVERAGE_PARTIAL";

    if (partialSignals) {
      return "PARTIALLY_READY_FOR_TICKET_CREATION";
    }

    return "READY_FOR_TICKET_CREATION";
  }

  // Doel: korte managementsamenvatting genereren van de gecombineerde review
  private buildExecutiveSummary(input: {
    overallStatus: CombinedRequirementsReview["overallStatus"];
    completeness: CombinedRequirementsReview["completeness"];
    alignment: CombinedRequirementsReview["alignment"];
    missingStates: CombinedRequirementsReview["missingStates"];
    missingValidations: CombinedRequirementsReview["missingValidations"];
    missingPermissions: CombinedRequirementsReview["missingPermissions"];
  }): string {
    if (input.overallStatus === "READY_FOR_TICKET_CREATION") {
      return "Requirements en design zijn voldoende compleet en aligned om duidelijke Jira tickets van te maken.";
    }

    if (input.overallStatus === "PARTIALLY_READY_FOR_TICKET_CREATION") {
      return "Requirements en design bieden een bruikbare basis, maar er zijn nog relevante hiaten in alignment, states, validaties of permissies.";
    }

    return "Requirements en design zijn nog niet sterk genoeg uitgewerkt om zonder extra refinement goede Jira tickets van te maken.";
  }
}

// Doel: dubbele strings verwijderen uit gecombineerde lijsten
function dedupe(items: string[]): string[] {
  return [...new Set(items)].filter(Boolean);
}
