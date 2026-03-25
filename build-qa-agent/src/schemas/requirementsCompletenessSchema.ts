import { z } from "zod";

// Doel: validatie van de output van de RequirementsCompletenessAgent
export const RequirementsCompletenessAssessmentSchema = z.object({
  overallStatus: z.enum(["COMPLETE", "PARTIALLY_COMPLETE", "INCOMPLETE"]),
  summary: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  openQuestions: z.array(z.string()),
  recommendations: z.array(z.string()),
  missingStates: z.array(z.string()),
  missingValidations: z.array(z.string()),
  missingPermissions: z.array(z.string()),
});

export type ParsedRequirementsCompletenessAssessment = z.infer<
  typeof RequirementsCompletenessAssessmentSchema
>;