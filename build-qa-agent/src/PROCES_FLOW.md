# Process Flow

Dit document beschrijft de technische procesflow van de QA DoR Agent applicatie.

Het doel van deze flow is om inzichtelijk te maken:

- hoe een Jira issue key wordt verwerkt
- hoe context uit Jira, Confluence en Figma wordt opgehaald
- hoe agents worden aangeroepen
- waar Zod-validatie plaatsvindt
- hoe het eindresultaat wordt opgebouwd
- hoe testscenario’s worden verrijkt en gepresenteerd

---

## Mulit flow overview
Flow 1: Requirements review
Confluence + Figma → RequirementsAlignmentAgent → review output

Flow 2: Jira DoR review
Jira + Confluence + Figma → DoR agents → assessment


## High-level flow Jira DoR review

```text
CLI input (issue key)
  ↓
index.ts
  ↓
JiraDorOrchestrator.evaluateFromJiraKey(issueKey)
  ↓
collectContext(issueKey)
  ├── Jira connector
  ├── Confluence connector
  └── Figma connector
  ↓
DorEvaluationContext
  ↓
Standard agents
  ├── DoR Assessment Agent
  ├── Requirement Clarity Agent
  ├── Acceptance Criteria Agent
  └── QA Readiness Agent
  ↓
TestScenarioAgent
  ↓
Normalization + validation
  ↓
FinalDorAssessment
  ↓
Readable terminal output