import { config } from "../../config.js";
import type { JiraSourceTicket, AcceptanceCriterion } from "../types.js";

// Bouwt de Basic Auth header op voor Jira Cloud API-calls.
function jiraAuthHeader(): string {
  const raw = `${config.jiraEmail}:${config.jiraApiToken}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

// Zet een onbekende Jira-waarde om naar tekst.
// Handig omdat description/body soms geen simpele string is.
function extractText(value: unknown): string {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

// Doel: acceptatiecriteria detecteren en classificeren per type (gherkin, bullet, etc.)
function extractAcceptanceCriteria(description: string) {
  if (!description) return [];

  const lines = description.split("\n").map((l) => l.trim());
  const results: AcceptanceCriterion[] = [];

  let inCriteriaSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower.includes("acceptance criteria") || lower.includes("criteria")) {
      inCriteriaSection = true;
      continue;
    }

    if (inCriteriaSection && line === "") {
      inCriteriaSection = false;
    }

    // Gherkin
    if (
      lower.includes("given") ||
      lower.includes("when") ||
      lower.includes("then")
    ) {
      results.push({ type: "gherkin", content: line });
      continue;
    }

    // Bullet
    if (line.startsWith("-") || line.startsWith("*")) {
      results.push({ type: "bullet", content: line });
      continue;
    }

    // Numbered
    if (/^\d+\./.test(line)) {
      results.push({ type: "numbered", content: line });
      continue;
    }

    // Text binnen AC sectie
    if (inCriteriaSection && line.length > 0) {
      results.push({ type: "text", content: line });
    }
  }

  return results;
}
// Haalt een Jira issue op en normaliseert de response naar ons eigen domeinmodel.
// Dit is de primaire bron voor de DoR-beoordeling.
export async function getJiraIssue(
  issueKey: string,
): Promise<JiraSourceTicket> {
  const fields = [
    "summary",
    "description",
    "comment",
    "labels",
    "issuetype",
    "priority",
    "status",
  ].join(",");

  const url = `${config.jiraBaseUrl}/rest/api/3/issue/${encodeURIComponent(issueKey)}?fields=${encodeURIComponent(fields)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: jiraAuthHeader(),
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch Jira issue ${issueKey}: ${res.status} ${res.statusText}`,
    );
  }

  const data = await res.json();

  const description = extractText(data.fields?.description);

  const comments =
    data.fields?.comment?.comments?.map((c: any) => extractText(c.body)) ?? [];

  return {
    key: data.key,
    title: data.fields?.summary ?? "",
    description,
    // Doel: Jira ticket verrijken met automatisch gevonden acceptatiecriteria
    acceptanceCriteria: extractAcceptanceCriteria(description),
    comments,
    labels: data.fields?.labels ?? [],
    issueType: data.fields?.issuetype?.name,
    priority: data.fields?.priority?.name,
    status: data.fields?.status?.name,
    raw: data,
  };
}
