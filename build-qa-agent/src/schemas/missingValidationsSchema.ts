import { z } from "zod";

const EvidenceReferenceSchema = z.object({
  sourceType: z.enum(["jira", "confluence", "figma", "derived"]),
  sourceId: z.string(),
  sourceLabel: z.string(),
  snippet: z.string().optional(),
  reason: z.string(),
});

const FindingWithEvidenceSchema = z.object({
  text: z.string(),
  evidence: z.array(EvidenceReferenceSchema),
});

// Doel: validatie van de output van de MissingValidationsAgent
export const MissingValidationsAssessmentSchema = z.object({
  overallStatus: z.enum([
    "VALIDATION_COVERAGE_GOOD",
    "VALIDATION_COVERAGE_PARTIAL",
    "VALIDATION_COVERAGE_POOR",
  ]),
  summary: z.string(),
  strengths: z.array(z.string()),
  missingValidations: z.array(FindingWithEvidenceSchema),
  partiallyDefinedValidations: z.array(FindingWithEvidenceSchema),
  inconsistentValidations: z.array(z.string()),
  openQuestions: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type ParsedMissingValidationsAssessment = z.infer<
  typeof MissingValidationsAssessmentSchema
>;
