import { openai } from "../openai/client.js";
import type {
  AgentAssessment,
  DorEvaluationContext,
  ReadinessStatus,
} from "../types.js";
import { AgentAssessmentSchema } from "../schemas/agentSchemas.js";

// Interne representatie van het JSON-resultaat dat we van het model verwachten.
interface RawAgentAssessment {
  agentName: string;
  summary: string;
  status: ReadinessStatus;
  criteria: {
    criterion: string;
    status: "PASS" | "PARTIAL" | "FAIL";
    explanation: string;
    improvementActions: string[];
  }[];
  openQuestions: string[];
}

// Basisklasse voor alle specialistische agents.
// Deze class bevat gedeelde logica voor:
// - prompt opbouwen
// - OpenAI aanroepen
// - JSON antwoord parsen
export abstract class BaseAgent {
  constructor(
    protected readonly agentName: string,
    protected readonly systemPrompt: string,
    protected readonly model = "gpt-5-nano",
  ) {}

  // Voert de beoordeling uit voor één agent.
  // Stuurt de context naar OpenAI en zet het antwoord om naar een typed resultaat.
  async assess(context: DorEvaluationContext): Promise<AgentAssessment> {
    const input = this.buildUserPrompt(context);

    const response = await openai.responses.create({
      model: this.model,
      instructions: this.systemPrompt,
      input,
    });

    const text = response.output_text?.trim();
    // Doel: tijdelijke debug om ruwe modeloutput te inspecteren vóór parsing en validatie
    console.log(`\n[${this.agentName}] raw output:\n`, text);
    if (!text) {
      throw new Error(`${this.agentName}: geen output ontvangen van model`);
    }

    const parsed = this.parseJson(text);

    return {
      agentName: parsed.agentName ?? this.agentName,
      summary: parsed.summary,
      status: parsed.status,
      criteria: parsed.criteria,
      openQuestions: parsed.openQuestions ?? [],
    };
  }

  // Bouwt de user prompt op voor het model.
  // Deze prompt bevat de volledige context en het JSON-formaat dat terug moet komen.
  protected buildUserPrompt(context: DorEvaluationContext): string {
    return `
Evaluate the Jira ticket below.

Return ONLY valid JSON in exactly this format:
{
  "agentName": "string",
  "summary": "string",
  "status": "READY | PARTIALLY_READY | NOT_READY",
  "criteria": [
    {
      "criterion": "string",
      "status": "PASS | PARTIAL | FAIL",
      "explanation": "string",
      "improvementActions": ["string"]
    }
  ],
  "openQuestions": ["string"]
}

Context:
${JSON.stringify(context, null, 2)}
`;
  }

  // Doel: modeloutput eerst als JSON parsen en daarna inhoudelijk valideren met Zod
  private parseJson(text: string) {
    try {
      const json = JSON.parse(text);
      return AgentAssessmentSchema.parse(json);
    } catch (error) {
      throw new Error(
        `${this.agentName}: output is geen geldige gestructureerde agent-response.\nOntvangen tekst:\n${text}\nFout: ${String(error)}`,
      );
    }
  }
}
