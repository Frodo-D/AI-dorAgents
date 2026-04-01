# QA DoR Agent

Een TypeScript-app die een Jira-ticket beoordeelt op **Definition of Ready (DoR)** met behulp van OpenAI, aangevuld met context uit **Jira**, **Confluence** en **Figma**.

De app haalt context op uit deze bronnen, laat meerdere gespecialiseerde agents een beoordeling doen, en geeft vervolgens een leesbare samenvatting terug met:

- DoR status
- belangrijkste sterke punten
- belangrijkste hiaten
- aanbevolen acties
- risico-inschatting
- testsuggesties / testscenario’s

---

## Wat doet deze repo?

Deze repo bevat een AI-gedreven QA/refinement tool die helpt om te bepalen of een Jira-ticket klaar is voor verdere uitwerking of sprint-opname.

### De app doet het volgende:

1. haalt een Jira-ticket op op basis van een issue key
2. zoekt aanvullende documentatie in Confluence
3. zoekt relevante designcontext in Figma
4. combineert alle context in één intern contextobject
5. laat meerdere specialistische agents die context beoordelen
6. maakt een compacte, leesbare samenvatting
7. genereert daarnaast gestructureerde testscenario’s

---

## Huidige functionaliteit

De huidige versie ondersteunt:

- Jira issue ophalen
- Confluence pagina’s zoeken en ophalen
- Figma links detecteren en Figma data ophalen
- DoR-beoordeling via meerdere agents
- validatie van agent-output met Zod
- validatie van eindoutput met Zod
- gespecialiseerde `TestScenarioAgent` met eigen outputschema
- leesbare terminal-output

---

## Architectuur

De app bestaat uit 4 hoofdlagen:

### 1. Connectors

Verantwoordelijk voor communicatie met externe systemen.

- `src/connectors/jira.ts`
- `src/connectors/confluence.ts`
- `src/connectors/figma.ts`

### 2. Agents

Verantwoordelijk voor beoordeling of generatie van output op basis van context.

#### Beoordelingsagents

Deze gebruiken een generieke `BaseAgent` en leveren `AgentAssessment` terug.

- `DorAssessmentAgent`
- `RequirementClarityAgent`
- `AcceptanceCriteriaAgent`
- `QaReadinessAgent`

#### Gespecialiseerde agenten

Deze heeft een eigen outputschema.

- `TestScenarioAgent`
- `requirementReviewAgent`

### 3. Orchestrator

De centrale flow-controller van de applicatie.

- `src/orchestrator/jiraDorOrchestrator.ts`

Taken:

- context ophalen
- agents uitvoeren
- output samenvoegen
- eindresultaat valideren

### 4. Schemas

Zod-schema’s voor validatie van AI-output.

- `src/schemas/agentSchemas.ts`
- `src/schemas/finalAssessmentSchema.ts`
- `src/schemas/testScenarioSchema.ts`

---

## Belangrijkste flow

```text
index.ts
  ↓
JiraDorOrchestrator.evaluateFromJiraKey(issueKey)
  ↓
collectContext()
  ├── Jira
  ├── Confluence
  └── Figma
  ↓
Beoordelingsagents
  ├── DoR Assessment
  ├── Requirement Clarity
  ├── Acceptance Criteria
  └── QA Readiness
  ↓
TestScenarioAgent
  ↓
Eindresultaat opbouwen + valideren
  ↓
Leesbare output in terminal
```

## Agents runnen

DoR agent

- pnpm run dev {Jira-ticket nummer} (bijvoorbeeld TONM-137)

requirement agent

- pnpm run requirements-review {confluence page ID} {Figma file key} {figma node ID}
