import { z } from "zod";

// Doel: validatie van één criterium in agent-output
export const AgentCriterionResultSchema = z.object({
  criterion: z.string(),
  status: z.enum(["PASS", "PARTIAL", "FAIL"]),
  explanation: z.string(),
  improvementActions: z.array(z.string()),
});

// Doel: validatie van volledige agent-output
export const AgentAssessmentSchema = z.object({
  agentName: z.string(),
  summary: z.string(),
  status: z.enum(["READY", "PARTIALLY_READY", "NOT_READY"]),
  criteria: z.array(AgentCriterionResultSchema),
  openQuestions: z.array(z.string()).default([]),
});

export type ParsedAgentAssessment = z.infer<typeof AgentAssessmentSchema>;
