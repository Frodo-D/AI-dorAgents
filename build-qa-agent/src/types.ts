// Mogelijke eindstatus voor een DoR-beoordeling.
export type ReadinessStatus = "READY" | "PARTIALLY_READY" | "NOT_READY";

// Inhoudelijke beoordeling van één criterium binnen een agent.
export interface AgentCriterionResult {
  criterion: string;
  status: "PASS" | "PARTIAL" | "FAIL";
  explanation: string;
  improvementActions: string[];
}

// Resultaat van één specialistische agent.
export interface AgentAssessment {
  agentName: string;
  summary: string;
  status: ReadinessStatus;
  criteria: AgentCriterionResult[];
  openQuestions: string[];
}

// Samengevoegde einduitkomst van alle agenten samen.
export interface FinalDorAssessment {
  ticketKey: string;
  overallStatus: ReadinessStatus;
  executiveSummary: string;
  strengths: string[];
  gaps: string[];
  recommendedActions: string[];
  agentAssessments: AgentAssessment[];
  riskScore?: number;
  riskReason?: string;
  testScenarios?: TestScenario[];
}

// Doel: compacte, leesbare weergave van de eindbeoordeling voor console of Jira comment
export interface FinalDorAssessmentView {
  ticketKey: string;
  overallStatus: ReadinessStatus;
  summary: string;
  topStrengths: string[];
  topGaps: string[];
  topActions: string[];
}

// Doel: gestructureerde representatie van een acceptatiecriterium inclusief type
export interface AcceptanceCriterion {
  type: "gherkin" | "bullet" | "numbered" | "text";
  content: string;
}
// Genormaliseerde Jira-data uit de connector.
// Dit is de primaire bron voor de beoordeling.
export interface JiraSourceTicket {
  key: string;
  title: string;
  description: string;
  acceptanceCriteria: AcceptanceCriterion[];
  comments: string[];
  labels: string[];
  issueType?: string;
  priority?: string;
  status?: string;
  raw?: unknown;
}

// Vereenvoudigde Confluence-pagina voor aanvullende context.
export interface ConfluenceSourcePage {
  id: string;
  title: string;
  excerpt?: string;
  body?: string;
  url?: string;
}

// Vereenvoudigde Figma-file of node voor designcontext.
export interface FigmaSourceNode {
  fileKey: string;
  nodeId?: string;
  name?: string;
  type?: string;
  url?: string;
  summary?: string;
  raw?: unknown;
}

// Complete context die naar de agents gaat.
// Combineert Jira als hoofdbron met Confluence- en Figma-verrijking.
export interface DorEvaluationContext {
  jira: JiraSourceTicket;
  confluence: ConfluenceSourcePage[];
  figma: FigmaSourceNode[];
}

// Gestructureerd testscenario voor QA en latere automatisering
export interface TestScenario {
  title: string;
  type: "happy_flow" | "negative" | "validation" | "permission" | "edge_case";
  priority: "low" | "medium" | "high";
  expectedResult: string;
  automationCandidate: boolean;
  automationCandidateReason?: string;
  testSuite?: "smoke" | "regression" | "exploratory_follow_up";

  preconditions?: string[];
  testData?: string[];
  notes?: string;
  screenHint?: string;
}

//**********************Requirements allignment************************

// Context voor requirements review vóór ticketcreatie
export interface RequirementsReviewContext {
  confluence: {
    title: string;
    body: string;
    url?: string;
  };
  figma: {
    fileKey?: string;
    nodeId?: string;
    name?: string;
    type?: string;
    summary?: string;
    raw?: unknown;
    url?: string;
  }[];
}

// Status voor alignment tussen requirements en design
export type RequirementsAlignmentStatus =
  | "ALIGNED"
  | "PARTIALLY_ALIGNED"
  | "NOT_ALIGNED";

// Resultaat van de requirements alignment review
// Resultaat van een pure alignment review tussen Confluence requirements en Figma design
export interface RequirementsAlignmentAssessment {
  overallStatus: RequirementsAlignmentStatus;
  summary: string;
  strengths: string[];
  gaps: string[];
  openQuestions: string[];
  recommendations: string[];
  requirementsNotRepresentedInDesign: string[];
  designElementsWithoutRequirementBasis: string[];
  contradictions: string[];
}

// Context voor een requirements review op basis van alleen Confluence
export interface RequirementsCompletenessContext {
  confluence: {
    title: string;
    body: string;
    url?: string;
  };
}

// Status voor volledigheid van requirements
export type RequirementsCompletenessStatus =
  | "COMPLETE"
  | "PARTIALLY_COMPLETE"
  | "INCOMPLETE";

// Resultaat van een Confluence-only requirements review
export interface RequirementsCompletenessAssessment {
  overallStatus: RequirementsCompletenessStatus;
  summary: string;
  strengths: string[];
  gaps: string[];
  openQuestions: string[];
  recommendations: string[];
  missingStates: string[];
  missingValidations: string[];
  missingPermissions: string[];
}

// Context voor een review van ontbrekende states op basis van Confluence en Figma
export interface MissingStatesContext {
  confluence: {
    title: string;
    body: string;
    url?: string;
  };
  figma: {
    fileKey?: string;
    nodeId?: string;
    name?: string;
    type?: string;
    summary?: string;
    raw?: unknown;
    url?: string;
  }[];
}

// Status voor de dekking van states
export type MissingStatesStatus =
  | "STATE_COVERAGE_GOOD"
  | "STATE_COVERAGE_PARTIAL"
  | "STATE_COVERAGE_POOR";

// Resultaat van een state-focused review
export interface MissingStatesAssessment {
  overallStatus: MissingStatesStatus;
  summary: string;
  strengths: string[];
  missingStates: string[];
  partiallyDefinedStates: string[];
  inconsistentStates: string[];
  openQuestions: string[];
  recommendations: string[];
}

// Context voor een review van ontbrekende validaties op basis van Confluence en Figma
export interface MissingValidationsContext {
  confluence: {
    title: string;
    body: string;
    url?: string;
  };
  figma: {
    fileKey?: string;
    nodeId?: string;
    name?: string;
    type?: string;
    summary?: string;
    raw?: unknown;
    url?: string;
  }[];
}

// Status voor de dekking van validaties
export type MissingValidationsStatus =
  | "VALIDATION_COVERAGE_GOOD"
  | "VALIDATION_COVERAGE_PARTIAL"
  | "VALIDATION_COVERAGE_POOR";

// Resultaat van een validation-focused review
export interface MissingValidationsAssessment {
  overallStatus: MissingValidationsStatus;
  summary: string;
  strengths: string[];
  missingValidations: string[];
  partiallyDefinedValidations: string[];
  inconsistentValidations: string[];
  openQuestions: string[];
  recommendations: string[];
}