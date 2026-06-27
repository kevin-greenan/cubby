import path from "node:path";
import YAML from "yaml";
import { readText, workspacePath, writeText } from "./fs-utils.js";
import type { RedactOptions } from "./types.js";

interface RedactionFinding {
  line: number;
  kind: string;
  evidence: string;
}

const PATTERNS = [
  { kind: "email", pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { kind: "phone", pattern: /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g },
  { kind: "ssn", pattern: /\b\d{3}-\d{2}-\d{4}\b/g },
  { kind: "student-name-label", pattern: /\b(student name|child name|full name)\s*[:=]\s*\S+/gi },
  { kind: "date-of-birth", pattern: /\b(DOB|date of birth)\s*[:=]\s*\S+/gi },
  { kind: "address-label", pattern: /\b(address|home address)\s*[:=]\s*\S+/gi }
];

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

function findSensitivePatterns(content: string): RedactionFinding[] {
  const findings: RedactionFinding[] = [];
  for (const [index, line] of content.split(/\r?\n/).entries()) {
    for (const { kind, pattern } of PATTERNS) {
      pattern.lastIndex = 0;
      for (const match of line.matchAll(pattern)) {
        findings.push({
          line: index + 1,
          kind,
          evidence: maskEvidence(match[0])
        });
      }
    }
  }
  return findings;
}

function maskEvidence(value: string): string {
  if (value.length <= 4) {
    return "****";
  }
  return `${value.slice(0, 2)}...${value.slice(-2)}`;
}

function normalizeWorkspacePath(workspace: string, candidate: string): string | undefined {
  const absolute = path.isAbsolute(candidate) ? path.resolve(candidate) : workspacePath(workspace, candidate);
  const relative = path.relative(workspace, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return undefined;
  }
  return relative.split(path.sep).join("/");
}
