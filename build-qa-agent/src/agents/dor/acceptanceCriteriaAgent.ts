import { BaseAgent } from "../baseAgent.js";
import { loadPrompt } from "../../utils/promptLoader.js";


// Specialistische agent die de kwaliteit en testbaarheid van acceptatiecriteria beoordeelt.
export class AcceptanceCriteriaAgent extends BaseAgent {
  constructor() {
    super("Acceptance Criteria Agent", loadPrompt("dor/acceptance-criteria"));
  }
}
