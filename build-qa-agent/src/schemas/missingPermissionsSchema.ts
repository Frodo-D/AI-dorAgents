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

// Doel: validatie van de output van de MissingPermissionsAgent
export const MissingPermissionsAssessmentSchema = z.object({
  overallStatus: z.enum([
    "PERMISSION_COVERAGE_GOOD",
    "PERMISSION_COVERAGE_PARTIAL",
    "PERMISSION_COVERAGE_POOR",
  ]),
  summary: z.string(),
  strengths: z.array(z.string()),
  missingPermissions: z.array(FindingWithEvidenceSchema),
  partiallyDefinedPermissions: z.array(FindingWithEvidenceSchema),
  inconsistentPermissions: z.array(z.string()),
  openQuestions: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type ParsedMissingPermissionsAssessment = z.infer<
  typeof MissingPermissionsAssessmentSchema
>;
