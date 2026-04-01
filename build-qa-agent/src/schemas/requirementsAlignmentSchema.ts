import { z } from "zod";

// Doel: validatie van de output van de RequirementsAlignmentAgent
export const RequirementsAlignmentAssessmentSchema = z.object({
  overallStatus: z.enum(["ALIGNED", "PARTIALLY_ALIGNED", "NOT_ALIGNED"]),
  summary: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  openQuestions: z.array(z.string()),
  recommendations: z.array(z.string()),
  requirementsNotRepresentedInDesign: z.array(z.string()),
  designElementsWithoutRequirementBasis: z.array(z.string()),
  contradictions: z.array(z.string()),
});

export type ParsedRequirementsAlignmentAssessment = z.infer<
  typeof RequirementsAlignmentAssessmentSchema
>;
