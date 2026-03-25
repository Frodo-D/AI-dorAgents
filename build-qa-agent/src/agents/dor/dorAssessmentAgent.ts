import { BaseAgent } from "../baseAgent.js";
import { loadPrompt } from "../../utils/promptLoader.js";

// Specialistische agent die het ticket als geheel toetst aan Definition of Ready.
export class DorAssessmentAgent extends BaseAgent {
  constructor() {
    super("DoR Assessment", loadPrompt("dor/dor-assessment"));
  }
}
