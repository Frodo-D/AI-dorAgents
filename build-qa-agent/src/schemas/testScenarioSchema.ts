import { z } from "zod";

export const TestScenarioSchema = z.object({
  title: z.string(),
  type: z.enum([
    "happy_flow",
    "negative",
    "validation",
    "permission",
    "edge_case",
  ]),
  priority: z.enum(["low", "medium", "high"]),
  expectedResult: z.string(),
  automationCandidate: z.boolean(),
  automationCandidateReason: z.string().optional(),
  testSuite: z.enum(["smoke", "regression", "exploratory_follow_up"]).optional(),

  preconditions: z.array(z.string()).optional(),
  testData: z.array(z.string()).optional(),
  notes: z.string().optional(),
  screenHint: z.string().optional(),
  
});

export const TestScenarioListSchema = z.array(TestScenarioSchema);
