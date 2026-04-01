import { z } from "zod";

// Doel: validatie van de geaggregeerde QA review output
export const QAReviewSummarySchema = z.object({
  overallQaReadiness: z.enum(["READY", "PARTIAL", "BLOCKED"]),
  executiveSummary: z.string(),
  topQaRisks: z.array(z.string()),
  clarificationPoints: z.array(z.string()),
  testPreparationNotes: z.array(z.string()),
  recommendedQaFocus: z.array(z.string()),
});

export type ParsedQAReviewSummary = z.infer<typeof QAReviewSummarySchema>;
