import fs from "fs";
import path from "path";

// Doel: markdown prompts laden en placeholders vervangen
export function loadPrompt(name: string): string {
  const basePath = path.resolve(process.cwd(), "src/prompts");

  const filePath = path.join(basePath, `${name}.md`);
  const sharedPath = path.join(basePath, "shared-context.md");

  const prompt = fs.readFileSync(filePath, "utf-8");
  const shared = fs.readFileSync(sharedPath, "utf-8");

  return prompt.replace("{{SHARED_CONTEXT}}", shared);
}