import { z } from "zod";
import { AgentAssessmentSchema } from "./agentSchemas.js";
import { TestScenarioSchema } from "./testScenarioSchema.js";

// Doel: validatie van de volledige eindoutput van de orchestrator
export const FinalDorAssessmentSchema = z.object({
  ticketKey: z.string(),
  overallStatus: z.enum(["READY", "PARTIALLY_READY", "NOT_READY"]),
  executiveSummary: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  recommendedActions: z.array(z.string()),
  agentAssessments: z.array(AgentAssessmentSchema),
  riskScore: z.number().optional(),
  riskReason: z.string().optional(),
  testScenarios: z.array(TestScenarioSchema).optional(),
});

export type ParsedFinalDorAssessment = z.infer<typeof FinalDorAssessmentSchema>;
