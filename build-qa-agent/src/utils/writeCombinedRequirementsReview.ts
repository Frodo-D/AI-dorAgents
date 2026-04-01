import fs from "fs";
import path from "path";
import type { CombinedRequirementsReview } from "../types.js";
import { renderCombinedRequirementsReviewMarkdown } from "./renderCombinedRequirementsReview.js";

// Doel: gecombineerde review naar JSON en Markdown bestanden schrijven
export function writeCombinedRequirementsReviewFiles(params: {
  review: CombinedRequirementsReview;
  outputDir?: string;
  baseFileName?: string;
}) {
  const outputDir = params.outputDir ?? path.resolve(process.cwd(), "outputs");
  const baseFileName = params.baseFileName ?? "combined-requirements-review";

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const jsonPath = path.join(outputDir, `${baseFileName}.json`);
  const mdPath = path.join(outputDir, `${baseFileName}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify(params.review, null, 2), "utf-8");
  fs.writeFileSync(
    mdPath,
    renderCombinedRequirementsReviewMarkdown(params.review),
    "utf-8",
  );

  return {
    jsonPath,
    mdPath,
  };
}
