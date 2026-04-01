import { QAReviewSummarySchema } from "../schemas/qaReviewSummarySchema.js";
import type { CombinedRequirementsReview, QAReviewSummary } from "../types.js";

// Doel: gecombineerde requirements review vertalen naar QA-bruikbare samenvatting
export class QAReviewAggregator {
  // Doel: QA review samenvatten op basis van bestaande review-uitkomsten
  aggregate(review: CombinedRequirementsReview): QAReviewSummary {
    const overallQaReadiness = this.determineOverallQaReadiness(review);
    const topQaRisks = this.collectTopQaRisks(review);
    const clarificationPoints = this.collectClarificationPoints(review);
    const recommendedQaFocus = this.collectRecommendedQaFocus(review);
    const testPreparationNotes = this.collectTestPreparationNotes(
      review,
      overallQaReadiness,
    );

    const executiveSummary = this.buildExecutiveSummary({
      overallQaReadiness,
      topQaRisks,
      clarificationPoints,
    });

    const result = {
      overallQaReadiness,
      executiveSummary,
      topQaRisks,
      clarificationPoints,
      testPreparationNotes,
      recommendedQaFocus,
    };

    return QAReviewSummarySchema.parse(result);
  }

  // Doel: bepalen of QA hier al goed mee vooruit kan
  private determineOverallQaReadiness(
    review: CombinedRequirementsReview,
  ): QAReviewSummary["overallQaReadiness"] {
    if (
      review.overallStatus === "NOT_READY_FOR_TICKET_CREATION" ||
      review.missingStates.overallStatus === "STATE_COVERAGE_POOR" ||
      review.missingValidations.overallStatus === "VALIDATION_COVERAGE_POOR" ||
      review.missingPermissions.overallStatus === "PERMISSION_COVERAGE_POOR"
    ) {
      return "BLOCKED";
    }

    if (
      review.overallStatus === "PARTIALLY_READY_FOR_TICKET_CREATION" ||
      review.missingStates.overallStatus === "STATE_COVERAGE_PARTIAL" ||
      review.missingValidations.overallStatus ===
        "VALIDATION_COVERAGE_PARTIAL" ||
      review.missingPermissions.overallStatus === "PERMISSION_COVERAGE_PARTIAL"
    ) {
      return "PARTIAL";
    }

    return "READY";
  }

  // Doel: belangrijkste QA-risico's verzamelen uit deelreviews
  private collectTopQaRisks(review: CombinedRequirementsReview): string[] {
    return dedupe([
      ...review.missingStates.missingStates.slice(0, 3).map((finding) => {
        const sources = finding.evidence
          .map((evidence) => `${evidence.sourceType}:${evidence.sourceLabel}`)
          .join(", ");

        return `${finding.text} (bron: ${sources})`;
      }),
      ...review.missingValidations.missingValidations
        .slice(0, 3)
        .map((finding) => {
          const sources = finding.evidence
            .map((evidence) => `${evidence.sourceType}:${evidence.sourceLabel}`)
            .join(", ");

          return `${finding.text} (bron: ${sources})`;
        }),
      ...review.missingPermissions.missingPermissions
        .slice(0, 3)
        .map((finding) => {
          const sources = finding.evidence
            .map((evidence) => `${evidence.sourceType}:${evidence.sourceLabel}`)
            .join(", ");

          return `${finding.text} (bron: ${sources})`;
        }),
      ...review.alignment.contradictions.slice(0, 2),
      ...review.completeness.gaps.slice(0, 2),
    ]).slice(0, 8);
  }

  // Doel: open vragen verzamelen die QA waarschijnlijk eerst beantwoord wil hebben
  private collectClarificationPoints(
    review: CombinedRequirementsReview,
  ): string[] {
    return dedupe([
      ...review.completeness.openQuestions,
      ...review.alignment.openQuestions,
      ...review.missingStates.openQuestions,
      ...review.missingValidations.openQuestions,
      ...review.missingPermissions.openQuestions,
    ]).slice(0, 12);
  }

  // Doel: focusgebieden voor QA-testanalyse en refinement benoemen
  private collectRecommendedQaFocus(
    review: CombinedRequirementsReview,
  ): string[] {
    const focus: string[] = [];

    if (review.missingStates.missingStates.length > 0) {
      focus.push(
        "Werk ontbrekende states uit voordat volledige testanalyse wordt afgerond.",
      );
    }

    if (review.missingValidations.missingValidations.length > 0) {
      focus.push("Maak validaties en foutfeedback expliciet toetsbaar.");
    }

    if (review.missingPermissions.missingPermissions.length > 0) {
      focus.push("Verduidelijk rollen, rechten en gedrag zonder toegang.");
    }

    if (review.alignment.contradictions.length > 0) {
      focus.push(
        "Los tegenstrijdigheden tussen requirements en design eerst op.",
      );
    }

    if (review.completeness.gaps.length > 0) {
      focus.push(
        "Gebruik refinement om ontbrekende functionele details aan te vullen.",
      );
    }

    if (focus.length === 0) {
      focus.push(
        "De basis lijkt voldoende stabiel voor verdere testvoorbereiding.",
      );
    }

    return dedupe(focus);
  }

  // Doel: praktische notities geven voor QA-voorbereiding
  private collectTestPreparationNotes(
    review: CombinedRequirementsReview,
    readiness: QAReviewSummary["overallQaReadiness"],
  ): string[] {
    const notes: string[] = [];

    if (readiness === "BLOCKED") {
      notes.push(
        "Volledige testanalyse is nog te vroeg; eerst refinement op gaps uitvoeren.",
      );
      notes.push(
        "Beperk eventuele testvoorbereiding voorlopig tot hoofdflow en bekende aannames.",
      );
    }

    if (readiness === "PARTIAL") {
      notes.push(
        "Begin met conceptuele scenario’s, maar markeer open punten expliciet.",
      );
      notes.push(
        "Werk risico-gebaseerd: states, validaties en permissies eerst.",
      );
    }

    if (readiness === "READY") {
      notes.push(
        "De basis lijkt sterk genoeg om testscenario’s verder uit te werken.",
      );
      notes.push(
        "Gebruik de bestaande reviewoutput om testdekking systematisch op te bouwen.",
      );
    }

    if (review.missingStates.partiallyDefinedStates.length > 0) {
      notes.push(
        "Controleer of partially defined states voldoende concreet zijn voor verifieerbare tests.",
      );
    }

    if (review.missingValidations.partiallyDefinedValidations.length > 0) {
      notes.push(
        "Controleer of validatiefouten en foutfeedback toetsbaar geformuleerd zijn.",
      );
    }

    if (review.missingPermissions.partiallyDefinedPermissions.length > 0) {
      notes.push(
        "Controleer of rolgedrag per gebruikersgroep eenduidig is uitgewerkt.",
      );
    }

    return dedupe(notes).slice(0, 10);
  }

  // Doel: korte QA-managementsamenvatting genereren
  private buildExecutiveSummary(input: {
    overallQaReadiness: QAReviewSummary["overallQaReadiness"];
    topQaRisks: string[];
    clarificationPoints: string[];
  }): string {
    if (input.overallQaReadiness === "READY") {
      return "De requirements- en designbasis lijkt voldoende stabiel voor verdere QA-voorbereiding en testanalyse.";
    }

    if (input.overallQaReadiness === "PARTIAL") {
      return `Er is een bruikbare basis voor QA, maar er zijn nog relevante verduidelijkingen nodig. Belangrijkste risico's: ${summarizeItems(input.topQaRisks, 2)}.`;
    }

    return `QA is nog gedeeltelijk geblokkeerd door ontbrekende of onduidelijke informatie. Belangrijkste risico's: ${summarizeItems(input.topQaRisks, 3)}.`;
  }
}

// Doel: dubbele strings verwijderen en lege waarden wegfilteren
function dedupe(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()))].filter(
    (item) => item.length > 0,
  );
}

// Doel: korte tekst maken van een beperkt aantal items
function summarizeItems(items: string[], maxItems: number): string {
  const cleaned = dedupe(items).slice(0, maxItems);

  if (cleaned.length === 0) {
    return "geen bijzonderheden";
  }

  return cleaned.join(" ");
}
