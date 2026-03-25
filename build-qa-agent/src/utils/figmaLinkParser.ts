// Gestandaardiseerde representatie van een Figma-link die uit tekst is gehaald.
export interface ParsedFigmaLink {
  fileKey: string;
  nodeId?: string;
  url: string;
}

// Zoekt in tekst naar Figma-links en haalt fileKey en optioneel nodeId eruit.
// Dit gebruiken we op Jira descriptions, comments en Confluence-body's.
export function extractFigmaLinks(text: string): ParsedFigmaLink[] {
  if (!text) return [];

  const regex =
    /https?:\/\/(?:www\.)?figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)(?:\/[^?\s#]+)?(?:\?[^#\s]*node-id=([^&#\s]+))?/g;

  const matches = [...text.matchAll(regex)];

  return matches.map((match) => ({
    fileKey: match[1],
    nodeId: match[2] ? decodeURIComponent(match[2]) : undefined,
    url: match[0],
  }));
}
