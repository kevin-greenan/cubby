# Cubby Development Docs

These documents define Cubby's release-facing contracts, command surface, and local workflow examples.

Read order for implementation work:

1. [workspace-contract.md](workspace-contract.md) for installed workspace shape and ownership rules.
2. [manifest-and-managed-files.md](manifest-and-managed-files.md) for managed-file metadata, hashes, and repeat-init behavior.
3. [adapter-contract.md](adapter-contract.md) for provider-neutral source versus adapter-specific output.
4. [performance-library.md](performance-library.md) for hooks, extensions, tools, skills, and reusable assets.
5. [cli-reference.md](cli-reference.md) for command purpose, arguments, gates, and common flows.
6. [testing-and-acceptance.md](testing-and-acceptance.md) for checks that define release readiness.
7. [walkthrough-lifecycle.md](walkthrough-lifecycle.md) for the full local init-to-export loop.
8. [walkthrough-lesson-pack.md](walkthrough-lesson-pack.md) for a low-risk lesson pack example.
9. [walkthrough-parent-email.md](walkthrough-parent-email.md) for a review-gated family communication example.

Sample generated artifacts live in [../examples/sample-outputs](../examples/sample-outputs).

Run `python scripts/quality_check.py` after documentation or contract changes. GitHub Actions runs the same check on pushes and pull requests.

Run `npm run demo:lifecycle` after building the CLI to create an inspectable end-to-end workspace under `/tmp`.

If these docs conflict, follow the user's current instruction first, then the release-facing contract that owns the affected surface.
