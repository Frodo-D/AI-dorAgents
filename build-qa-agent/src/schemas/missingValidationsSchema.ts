import { z } from "zod";

// Doel: validatie van de output van de MissingValidationsAgent
export const MissingValidationsAssessmentSchema = z.object({
  overallStatus: z.enum([
    "VALIDATION_COVERAGE_GOOD",
    "VALIDATION_COVERAGE_PARTIAL",
    "VALIDATION_COVERAGE_POOR",
  ]),
  summary: z.string(),
  strengths: z.array(z.string()),
  missingValidations: z.array(z.string()),
  partiallyDefinedValidations: z.array(z.string()),
  inconsistentValidations: z.array(z.string()),
  openQuestions: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type ParsedMissingValidationsAssessment = z.infer<
  typeof MissingValidationsAssessmentSchema
>;