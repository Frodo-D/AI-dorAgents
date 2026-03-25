# IDE Assistant Context

## Projectdoel

Dit project is een agentic QA/refinement systeem in TypeScript met OpenAI.

Het systeem helpt met:
1. Jira tickets beoordelen op Definition of Ready (DoR)
2. Testscenario’s genereren
3. Requirements uit Confluence vergelijken met design in Figma vóór ticketcreatie

---

## Verwachte manier van helpen

Antwoord altijd:

- stap voor stap
- concreet
- per bestand
- exact aangeven waar code moet komen
- complete codeblokken geven die direct geplakt kunnen worden
- kort uitleggen waarom iets zo wordt gedaan
- geen vage high-level antwoorden geven als implementatiedetails nodig zijn

Gebruik deze structuur:

1. korte uitleg
2. stap X — bestand + locatie
3. codeblok
4. korte toelichting

Als code aangepast moet worden:
- noem altijd het exacte bestand
- noem waar in de file de code moet komen
- zeg expliciet wat vervangen, toevoegen of verwijderen is

---

## Architectuur

### Orchestrators
- `JiraDorOrchestrator`
- `RequirementsReviewOrchestrator`

### Standard agents (via `BaseAgent`)
- DoR Assessment Agent
- Requirement Clarity Agent
- Acceptance Criteria Agent
- QA Readiness Agent

### Specialized agents
- `TestScenarioAgent`
- `RequirementsAlignmentAgent`

---

## Belangrijke designkeuzes

### 1. Zod-validatie
Alle AI-output wordt gevalideerd met Zod.

### 2. Normalisatie in code
We vertrouwen niet alleen op prompts.
We normaliseren modeloutput vóór schema-parse wanneer nodig.

### 3. Scheiding van verantwoordelijkheden
- Connectors halen externe data op
- Agents redeneren over context
- Orchestrators sturen flow en combineren resultaten
- CLI files tonen leesbare output

### 4. Presentatielogica zit niet in agents
Groeperen, sorteren en printen gebeurt in:
- `src/index.ts`
- `src/requirementsReview.ts`

---

## TestScenario regels

### `type`
Alleen:
- `happy_flow`
- `negative`
- `validation`
- `permission`
- `edge_case`

### `testSuite`
Alleen:
- `smoke`
- `regression`
- `exploratory_follow_up`

`type` en `testSuite` zijn NIET hetzelfde.

---

## Huidige folderstructuur

```text
src/
  agents/
    dor/
    specialized/
  orchestrator/
  connectors/
  schemas/
  utils/
  prompts/
    dor/
    specialized/
```

## Prompts staan in markdown files, onderverdeeld in:
- src/prompts/dor/
- src/prompts/specialized/

## Gebruik loadPrompt(...) om prompts te laden.

## Huidige status

- Wat al werkt:
    - Jira DoR beoordeling
    - TestScenarioAgent met eigen outputschema
    - automationCandidate logica
    - automationCandidateReason
    - testSuite classificatie
    - grouping per testSuite
    - sortering op prioriteit
    - RequirementsAlignmentAgent
    - requirements review output met:
    - missingStates
    - missingValidations
    - missingPermissions
    - Belangrijke werkregels voor nieuwe features

## Bij nieuwe features altijd controleren:

types.ts
Zod schema
prompt markdown file
agent implementatie
orchestrator integratie
leesbare output / presentatie

Nooit alleen één laag aanpassen tenzij van toepassing