export type ManagedStatus = "created" | "skipped" | "updated" | "preserved-local-edit" | "failed";

export interface ManagedFileEntry {
  path: string;
  source: string;
  managed_version: string;
  hash_algorithm: "sha256";
  content_hash: string;
  local_edits_policy: "preserve";
}

export interface Manifest {
  cubby_version: string;
  adapter: {
    name: string;
    version: string;
  };
  profile: string;
  created_at: string;
  managed_files: ManagedFileEntry[];
  local_preserved_paths: string[];
}

export interface OperationResult {
  status: ManagedStatus;
  path: string;
  message: string;
}

export interface InitOptions {
  profile: string;
  adapter: string;
  workspace: string;
}

export interface ValidateOptions {
  workspace: string;
}
