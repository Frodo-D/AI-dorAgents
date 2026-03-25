import type { FigmaSourceNode } from "../types.js";
import { config } from "../../config.js";

// Bouwt de headers voor Figma API-calls op.
function figmaHeaders(): HeadersInit {
  return {
    "X-Figma-Token": config.figmaApiToken,
    Accept: "application/json",
  };
}

// Haalt metadata en documentinformatie van een Figma-file op.
// Wordt gebruikt als er alleen een file-link is en geen specifieke node.
export async function getFigmaFile(fileKey: string): Promise<FigmaSourceNode> {
  const url = `https://api.figma.com/v1/files/${encodeURIComponent(fileKey)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: figmaHeaders(),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch Figma file ${fileKey}: ${res.status} ${res.statusText}`,
    );
  }

  const data = await res.json();

  return {
    fileKey,
    name: data.name,
    type: "FILE",
    summary: `Figma file: ${data.name ?? fileKey}`,
    raw: data,
  };
}

// Haalt een specifieke node/frame/component uit een Figma-file op.
// Dit is nuttig als een ticket of document direct naar één scherm of component verwijst.
export async function getFigmaNode(
  fileKey: string,
  nodeId: string,
): Promise<FigmaSourceNode> {
  const url = `https://api.figma.com/v1/files/${encodeURIComponent(fileKey)}/nodes?ids=${encodeURIComponent(nodeId)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: figmaHeaders(),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch Figma node ${nodeId}: ${res.status} ${res.statusText}`,
    );
  }

  const data = await res.json();
  const node = data.nodes?.[nodeId]?.document;

  return {
    fileKey,
    nodeId,
    name: node?.name,
    type: node?.type,
    summary: node?.name ? `Figma node: ${node.name}` : `Figma node ${nodeId}`,
    raw: node,
  };
}
