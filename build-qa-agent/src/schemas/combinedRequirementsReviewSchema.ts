import { z } from "zod";
import { RequirementsCompletenessAssessmentSchema } from "./requirementsCompletenessSchema.js";
import { RequirementsAlignmentAssessmentSchema } from "./requirementsAlignmentSchema.js";
import { MissingStatesAssessmentSchema } from "./missingStatesSchema.js";
import { MissingValidationsAssessmentSchema } from "./missingValidationsSchema.js";
import { MissingPermissionsAssessmentSchema } from "./missingPermissionsSchema.js";

// Doel: validatie van een gecombineerde pre-ticket requirements review
export const CombinedRequirementsReviewSchema = z.object({
  executiveSummary: z.string(),
  overallStatus: z.enum([
    "READY_FOR_TICKET_CREATION",
    "PARTIALLY_READY_FOR_TICKET_CREATION",
    "NOT_READY_FOR_TICKET_CREATION",
  ]),
  keyRisks: z.array(z.string()),
  recommendations: z.array(z.string()),

  completeness: RequirementsCompletenessAssessmentSchema,
  alignment: RequirementsAlignmentAssessmentSchema,
  missingStates: MissingStatesAssessmentSchema,
  missingValidations: MissingValidationsAssessmentSchema,
  missingPermissions: MissingPermissionsAssessmentSchema,
});

export type ParsedCombinedRequirementsReview = z.infer<
  typeof CombinedRequirementsReviewSchema
>;
