import path from "node:path";
import YAML from "yaml";
import { readText, workspacePath, writeText } from "./fs-utils.js";
import { findSensitivePatterns } from "./sensitive.js";
import type { RedactOptions } from "./types.js";

export async function runRedact(options: RedactOptions): Promise<number> {
  const workspace = path.resolve(options.workspace);
  if (!options.source) {
    console.error("failed\t--source is required");
    return 1;
  }

  const sourcePath = normalizeWorkspacePath(workspace, options.source);
  if (!sourcePath) {
    console.error("failed\t--source must resolve inside the workspace");
    return 1;
  }

  const content = await readText(workspacePath(workspace, sourcePath));
  if (content === undefined) {
    console.error(`failed\t${sourcePath}\tsource file missing`);
    return 1;
  }

  const findings = findSensitivePatterns(content);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = `cubby/logs/redactions/redaction-${timestamp}.yaml`;
  await writeText(
    workspacePath(workspace, reportPath),
    YAML.stringify({
      created_at: new Date().toISOString(),
      source: sourcePath,
      status: findings.length > 0 ? "warn" : "pass",
      finding_count: findings.length,
      findings
    })
  );

  console.log(findings.length > 0 ? "Cubby redaction scan completed with warnings." : "Cubby redaction scan passed.");
  console.log(`Workspace: ${workspace}`);
  console.log(`Source: ${sourcePath}`);
  console.log(`Report: ${reportPath}`);
  console.log(`Findings: ${findings.length}`);
  for (const finding of findings) {
    console.log(`warn\tline ${finding.line}\t${finding.kind}\t${finding.evidence}`);
  }
  return 0;
}

function normalizeWorkspacePath(workspace: string, candidate: string): string | undefined {
  const absolute = path.isAbsolute(candidate) ? path.resolve(candidate) : workspacePath(workspace, candidate);
  const relative = path.relative(workspace, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return undefined;
  }
  return relative.split(path.sep).join("/");
}
