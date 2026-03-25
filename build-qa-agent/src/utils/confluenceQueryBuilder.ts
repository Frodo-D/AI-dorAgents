import type { JiraSourceTicket } from "../types.js";

// Bepaalt welke zoekqueries we naar Confluence sturen op basis van een Jira-ticket.
// Hiermee vergroten we de kans dat relevante documentatie wordt gevonden.
export function buildConfluenceQueries(ticket: JiraSourceTicket): string[] {
  const candidates = [
    ticket.key,
    ticket.title,
    `${ticket.key} ${ticket.title}`,
  ];

  return [...new Set(candidates.map((q) => q.trim()).filter(Boolean))];
}
