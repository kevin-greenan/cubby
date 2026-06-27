export interface SensitiveFinding {
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

export function findSensitivePatterns(content: string): SensitiveFinding[] {
  const findings: SensitiveFinding[] = [];
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
