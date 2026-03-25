import { z } from "zod";

// Doel: validatie van de output van de MissingStatesAgent
export const MissingStatesAssessmentSchema = z.object({
  overallStatus: z.enum([
    "STATE_COVERAGE_GOOD",
    "STATE_COVERAGE_PARTIAL",
    "STATE_COVERAGE_POOR",
  ]),
  summary: z.string(),
  strengths: z.array(z.string()),
  missingStates: z.array(z.string()),
  partiallyDefinedStates: z.array(z.string()),
  inconsistentStates: z.array(z.string()),
  openQuestions: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type ParsedMissingStatesAssessment = z.infer<
  typeof MissingStatesAssessmentSchema
>;