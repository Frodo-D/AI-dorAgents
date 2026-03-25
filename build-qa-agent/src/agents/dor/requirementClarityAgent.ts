import { BaseAgent } from "../baseAgent.js";
import { loadPrompt } from "../../utils/promptLoader.js";

// Specialistische agent die beoordeelt of de requirement duidelijk en afgebakend genoeg is.
export class RequirementClarityAgent extends BaseAgent {
  constructor() {
    super("Requirement Clarity", loadPrompt("dor/requirement-clarity"));
  }
}