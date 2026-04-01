import fs from "fs";
import path from "path";
import type { QAReviewSummary } from "../types.js";
import { renderQaReviewSummaryMarkdown } from "./renderQaReviewSummary.js";

// Doel: QA review samenvatting naar JSON en Markdown bestanden schrijven
export function writeQaReviewSummaryFiles(params: {
  summary: QAReviewSummary;
  outputDir?: string;
  baseFileName?: string;
}) {
  const outputDir = params.outputDir ?? path.resolve(process.cwd(), "outputs");
  const baseFileName = params.baseFileName ?? "qa-review-summary";

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const jsonPath = path.join(outputDir, `${baseFileName}.json`);
  const mdPath = path.join(outputDir, `${baseFileName}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify(params.summary, null, 2), "utf-8");
  fs.writeFileSync(
    mdPath,
    renderQaReviewSummaryMarkdown(params.summary),
    "utf-8",
  );

  return {
    jsonPath,
    mdPath,
  };
}
