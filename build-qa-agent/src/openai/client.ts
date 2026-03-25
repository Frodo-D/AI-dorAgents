import OpenAI from "openai";
import { config } from "../../config.js";

// Maakt één gedeelde OpenAI client aan voor de hele applicatie.
// Alle agents gebruiken deze client om beoordelingen op te vragen.
export const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});
