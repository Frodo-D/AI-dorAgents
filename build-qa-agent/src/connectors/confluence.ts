import { config } from "../../config.js";
import type { ConfluenceSourcePage } from "../types.js";

// Bouwt de Basic Auth header op voor Confluence Cloud API-calls.
function confluenceAuthHeader(): string {
  const raw = `${config.confluenceEmail}:${config.confluenceApiToken}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

// Zoekt Confluence-pagina's op basis van een zoekterm.
// Wordt gebruikt om aanvullende documentatie bij een Jira-ticket te vinden.
export async function searchConfluencePages(
  query: string,
): Promise<ConfluenceSourcePage[]> {
  const cql = `text ~ "${query.replace(/"/g, '\\"')}"`;
  const url = `${config.confluenceBaseUrl}/wiki/rest/api/search?cql=${encodeURIComponent(cql)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: confluenceAuthHeader(),
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to search Confluence: ${res.status} ${res.statusText}`,
    );
  }

  const data = await res.json();

  return (data.results ?? []).map((item: any) => ({
    id: item.content?.id ?? item.id,
    title: item.title ?? item.content?.title ?? "",
    excerpt: item.excerpt ?? "",
    url: item.url ? `${config.confluenceBaseUrl}${item.url}` : undefined,
  }));
}

// Haalt de volledige inhoud van één Confluence-pagina op.
// Dit wordt gebruikt om de documentatie inhoudelijk mee te nemen in de beoordeling.
export async function getConfluencePage(
  pageId: string,
): Promise<ConfluenceSourcePage> {
  const url = `${config.confluenceBaseUrl}/wiki/api/v2/pages/${encodeURIComponent(pageId)}?body-format=storage`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: confluenceAuthHeader(),
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch Confluence page ${pageId}: ${res.status} ${res.statusText}`,
    );
  }

  const data = await res.json();

  return {
    id: String(data.id),
    title: data.title ?? "",
    body: data.body?.storage?.value ?? "",
    url:
      data._links?.base && data._links?.webui
        ? `${data._links.base}${data._links.webui}`
        : undefined,
  };
}
