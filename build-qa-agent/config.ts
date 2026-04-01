// Laadt environment variables uit .env en maakt ze beschikbaar via process.env.
import "dotenv/config";

// Helper om te zorgen dat verplichte environment variables bestaan.
// Gooit direct een fout bij startup als een waarde ontbreekt.
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Centrale applicatieconfiguratie.
// Hier verzamelen we alle credentials en basisinstellingen voor OpenAI,
// Jira, Confluence en Figma op één plek.
export const config = {
  openaiApiKey: required("OPENAI_API_KEY"),
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-5-nano",

  jiraBaseUrl: required("JIRA_BASE_URL"),
  jiraEmail: required("JIRA_EMAIL"),
  jiraApiToken: required("JIRA_API_TOKEN"),

  confluenceBaseUrl: required("CONFLUENCE_BASE_URL"),
  confluenceEmail: required("CONFLUENCE_EMAIL"),
  confluenceApiToken: required("CONFLUENCE_API_TOKEN"),

  figmaApiToken: required("FIGMA_API_TOKEN"),
};
