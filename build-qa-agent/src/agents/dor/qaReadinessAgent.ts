import { BaseAgent } from "../baseAgent.js";
import { loadPrompt } from "../../utils/promptLoader.js";

// Specialistische agent die kijkt of er vanuit QA-perspectief genoeg informatie is om te testen.
export class QaReadinessAgent extends BaseAgent {
  constructor() {
    super("QA Readiness", loadPrompt("dor/qa-readiness"));
  }
}
