// Doel: page IDs uit Confluence URLs halen zodat directe pagina-ophaal mogelijk wordt
export function extractConfluencePageIds(text: string): string[] {
  if (!text) {
    return [];
  }

  const urls = Array.from(
    text.matchAll(/https?:\/\/[^\s)"'>]+/gi),
    (match) => match[0],
  );

  const pageIds: string[] = [];

  for (const url of urls) {
    try {
      const parsed = new URL(url);

      // Voorbeeld:
      // /wiki/spaces/SPACE/pages/123456789/Page+Title
      // /spaces/SPACE/pages/123456789/Page+Title
      const pathMatch = parsed.pathname.match(/\/pages\/(\d+)/);
      if (pathMatch?.[1]) {
        pageIds.push(pathMatch[1]);
        continue;
      }

      // Soms zit pageId in query params
      const pageIdFromQuery = parsed.searchParams.get("pageId");
      if (pageIdFromQuery) {
        pageIds.push(pageIdFromQuery);
      }
    } catch {
      // Ongeldige URL negeren
    }
  }

  return [...new Set(pageIds)];
}
