import { AcceptanceCriteriaAgent } from "../agents/dor/acceptanceCriteriaAgent.js";
import { DorAssessmentAgent } from "../agents/dor/dorAssessmentAgent.js";
import { QaReadinessAgent } from "../agents/dor/qaReadinessAgent.js";
import { RequirementClarityAgent } from "../agents/dor/requirementClarityAgent.js";
import { TestScenarioAgent } from "../agents/specialized/testScenarioAgent.js";
import {
  getConfluencePage,
  searchConfluencePages,
} from "../connectors/confluence.js";
import { getFigmaFile, getFigmaNode } from "../connectors/figma.js";
import { getJiraIssue } from "../connectors/jira.js";
import type {
  AgentAssessment,
  ConfluenceSourcePage,
  DorEvaluationContext,
  FigmaSourceNode,
  FinalDorAssessment,
  ReadinessStatus,
} from "../types.js";
import { buildConfluenceQueries } from "../utils/confluenceQueryBuilder.js";
import { extractFigmaLinks } from "../utils/figmaLinkParser.js";
import { FinalDorAssessmentSchema } from "../schemas/finalAssessmentSchema.js";
import { extractConfluencePageIds } from "../utils/confluenceLinkParser.js";

// Doel: debug logging centraal aan/uit kunnen zetten
const DEBUG = true;

// Centrale orchestrator.
// Verantwoordelijk voor:
// 1. context ophalen uit Jira, Confluence en Figma
// 2. specialistische agents aanroepen
// 3. resultaten samenvoegen tot één eindbeoordeling
export class JiraDorOrchestrator {
  private readonly agents = [
    new DorAssessmentAgent(),
    new RequirementClarityAgent(),
    new AcceptanceCriteriaAgent(),
    new QaReadinessAgent(),
  ];

  // Doel: gespecialiseerde agent voor testscenario's apart houden vanwege afwijkend outputschema
  private readonly testScenarioAgent = new TestScenarioAgent();

  // Startpunt voor een beoordeling op basis van een Jira issue key.
  // Eerst wordt alle context verzameld, daarna draaien de agents.
  // Doel: volledig ticket beoordelen op basis van een Jira issue key
  async evaluateFromJiraKey(issueKey: string): Promise<FinalDorAssessment> {
    console.log("[orchestrator] start evaluateFromJiraKey", issueKey);

    const context = await this.collectContext(issueKey);
    console.log("[orchestrator] context opgehaald");

    const agentAssessments = await Promise.all(
      this.agents.map((agent) => agent.assess(context)),
    );
    console.log("[orchestrator] standaard agents klaar");

    const testScenarios = await this.testScenarioAgent.assess(context);
    console.log("[orchestrator] test scenario agent klaar");

    const overallStatus = this.determineOverallStatus(agentAssessments);
    const strengths = this.collectStrengths(agentAssessments);
    const gaps = this.collectGaps(agentAssessments);
    const recommendedActions = this.collectActions(agentAssessments);
    const risk = this.calculateRiskScore(gaps);

    const result = {
      ticketKey: context.jira.key,
      overallStatus,
      executiveSummary: this.buildExecutiveSummary(
        overallStatus,
        strengths,
        gaps,
      ),
      strengths,
      gaps,
      recommendedActions,
      agentAssessments,
      riskScore: risk.score,
      riskReason: risk.reason,
      testScenarios,
      consultedSources: context.consultedSources,
    };

    console.log("[orchestrator] result opgebouwd");

    // Doel: volledige orchestrator-output valideren voordat die naar buiten gaat
    return FinalDorAssessmentSchema.parse(result);
  }

  // Doel: DoR context opbouwen op basis van Jira en alleen expliciet gelinkte externe bronnen
  private async collectContext(
    issueKey: string,
  ): Promise<DorEvaluationContext> {
    console.log("[collectContext] Jira ophalen");
    const jira = await getJiraIssue(issueKey);
    console.log("[collectContext] Jira opgehaald:", jira.key);

    // Doel: expliciet gelinkte Confluence pagina's uit description/comments halen
    const linkedConfluencePageIds = [
      ...extractConfluencePageIds(jira.description),
      ...jira.comments.flatMap((comment) => extractConfluencePageIds(comment)),
    ];

    console.log(
      "[collectContext] gevonden Confluence page IDs uit ticket:",
      linkedConfluencePageIds,
    );

    const linkedConfluence = [];

    for (const pageId of linkedConfluencePageIds) {
      try {
        console.log(
          "[collectContext] directe Confluence page ophalen:",
          pageId,
        );
        const page = await getConfluencePage(pageId);

        linkedConfluence.push({
          id: page.id,
          title: page.title,
          url: page.url,
          body: page.body ?? "",
        });
      } catch (error) {
        console.warn(
          "[collectContext] directe Confluence page ophalen mislukt:",
          pageId,
          error,
        );
      }
    }

    console.log(
      "[collectContext] geraadpleegde Confluence pagina's:",
      linkedConfluence.map((page) => ({
        id: page.id,
        title: page.title,
      })),
    );

    // Doel: expliciet gelinkte Figma refs uit description/comments halen
    const figmaLinks = [
      ...extractFigmaLinks(jira.description),
      ...jira.comments.flatMap((comment) => extractFigmaLinks(comment)),
    ];

    const uniqueFigmaLinks = dedupeFigmaLinks(figmaLinks).slice(0, 5);

    console.log(
      "[collectContext] gevonden Figma refs:",
      uniqueFigmaLinks.map((link) => ({
        fileKey: link.fileKey,
        nodeId: link.nodeId,
      })),
    );

    const linkedFigma = [];

    for (const link of uniqueFigmaLinks) {
      try {
        console.log("[collectContext] Figma ophalen:", link);

        const figmaItem = link.nodeId
          ? await getFigmaNode(link.fileKey, link.nodeId)
          : await getFigmaFile(link.fileKey);

        linkedFigma.push({
          fileKey: link.fileKey,
          nodeId: link.nodeId,
          name: figmaItem.name,
          type: figmaItem.type,
        });
      } catch (error) {
        console.warn("[collectContext] Figma ophalen mislukt:", link, error);
      }
    }

    console.log("[collectContext] geraadpleegde Figma items:", linkedFigma);

    return {
      jira,
      linkedConfluence,
      linkedFigma,
      consultedSources: {
        jira: jira.key,
        confluence: linkedConfluence.map((page) => `${page.id}: ${page.title}`),
        figma: linkedFigma.map(
          (item) => `${item.fileKey}${item.nodeId ? `#${item.nodeId}` : ""}`,
        ),
      },
    };
  }

  // Bepaalt de eindstatus op basis van alle agentuitkomsten.
  // NOT_READY wint van PARTIALLY_READY, en PARTIALLY_READY wint van READY.
  private determineOverallStatus(
    assessments: AgentAssessment[],
  ): ReadinessStatus {
    const statuses = assessments.map((a) => a.status);

    if (statuses.includes("NOT_READY")) {
      return "NOT_READY";
    }

    if (statuses.includes("PARTIALLY_READY")) {
      return "PARTIALLY_READY";
    }

    return "READY";
  }

  // Verzamelt alle positieve criteria uit de agentbeoordelingen.
  private collectStrengths(assessments: AgentAssessment[]): string[] {
    return dedupe(
      assessments.flatMap((assessment) =>
        assessment.criteria
          .filter((c) => c.status === "PASS")
          .map((c) => `${assessment.agentName}: ${c.criterion}`),
      ),
    );
  }

  // Doel: inhoudelijk vergelijkbare bevindingen normaliseren zodat output minder dubbel wordt
  private normalizeFinding(text: string): string {
    const lower = text.toLowerCase();

    if (lower.includes("acceptatiecriteria") || lower.includes("criteria")) {
      return "Acceptatiecriteria zijn onvoldoende concreet of toetsbaar";
    }

    if (lower.includes("scope") || lower.includes("afbakening")) {
      return "Scope en afbakening zijn onvoldoende duidelijk";
    }

    if (
      lower.includes("test") ||
      lower.includes("qa") ||
      lower.includes("verwachte resultaten")
    ) {
      return "Testbaarheid en verwachte resultaten zijn onvoldoende uitgewerkt";
    }

    if (
      lower.includes("rol") ||
      lower.includes("permissie") ||
      lower.includes("rechten")
    ) {
      return "Gebruikersrollen en rechten zijn onvoldoende duidelijk";
    }

    if (
      lower.includes("fout") ||
      lower.includes("exceptie") ||
      lower.includes("uitzondering")
    ) {
      return "Foutscenario's en uitzonderingen ontbreken of zijn onduidelijk";
    }

    return text;
  }
  // Doel: belangrijkste hiaten verzamelen en dubbeling verminderen door compacter te formuleren
  private collectGaps(assessments: AgentAssessment[]): string[] {
    const rawGaps = assessments.flatMap((assessment) =>
      assessment.criteria
        .filter((c) => c.status === "FAIL" || c.status === "PARTIAL")
        .map((c) => c.criterion.trim()),
    );

    const normalized = rawGaps.map((gap) => this.normalizeFinding(gap));
    return dedupe(normalized);
  }

  // Verzamelt alle concrete verbeteracties uit de agents.
  private collectActions(assessments: AgentAssessment[]): string[] {
    return dedupe(
      assessments.flatMap((assessment) =>
        assessment.criteria.flatMap((c) => c.improvementActions),
      ),
    );
  }

  // Doel: ruwe risico-inschatting maken op basis van hoeveelheid gaps
  private calculateRiskScore(gaps: string[]): {
    score: number;
    reason: string;
  } {
    if (gaps.length >= 6) {
      return {
        score: 9,
        reason: "Veel openstaande hiaten en onduidelijkheden",
      };
    }

    if (gaps.length >= 3) {
      return { score: 6, reason: "Meerdere inhoudelijke hiaten aanwezig" };
    }

    return { score: 3, reason: "Beperkt aantal hiaten" };
  }

  // Bouwt een korte managementsamenvatting op van de eindbeoordeling.
  private buildExecutiveSummary(
    status: ReadinessStatus,
    strengths: string[],
    gaps: string[],
  ): string {
    if (status === "READY") {
      return `Ticket is READY. Er is voldoende context om het werk op te pakken. Belangrijkste sterke punten: ${strengths.slice(0, 3).join("; ")}.`;
    }

    if (status === "PARTIALLY_READY") {
      return `Ticket is PARTIALLY_READY. De basis is aanwezig, maar er zijn nog hiaten. Belangrijkste gaps: ${gaps.slice(0, 3).join("; ")}.`;
    }

    return `Ticket is NOT_READY. Er ontbreken cruciale elementen voor uitvoering en toetsing. Belangrijkste gaps: ${gaps.slice(0, 3).join("; ")}.`;
  }

  private buildReadableView(result: FinalDorAssessment) {
    return {
      ticketKey: result.ticketKey,
      overallStatus: result.overallStatus,
      summary: result.executiveSummary,
      topStrengths: result.strengths.slice(0, 3),
      topGaps: result.gaps.slice(0, 5),
      topActions: result.recommendedActions.slice(0, 5),
    };
  }
}
// Doel: ruwe agentoutput omzetten naar een compacte en beter leesbare eindweergave

// Verwijdert dubbele strings uit een lijst.
function dedupe(items: string[]): string[] {
  return [...new Set(items)].filter(Boolean);
}

// Verwijdert dubbele objecten op basis van id.
// Handig voor Confluence zoekresultaten.
function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }

  return result;
}

// Verwijdert dubbele Figma-links op basis van fileKey + nodeId.
function dedupeFigmaLinks<T extends { fileKey: string; nodeId?: string }>(
  items: T[],
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    const key = `${item.fileKey}::${item.nodeId ?? ""}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}
