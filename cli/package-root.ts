import path from "node:path";

export const PACKAGE_ROOT = path.resolve(__dirname, "../..");

export function packagePath(relativePath: string): string {
  return path.resolve(PACKAGE_ROOT, relativePath);
}
