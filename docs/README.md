# Cubby Development Docs

These documents define Cubby's release-facing contracts, command surface, and local workflow examples.

Read order for implementation work:

1. [../PLAN.md](../PLAN.md) for product scope, milestones, and source-of-truth requirements.
2. [workspace-contract.md](workspace-contract.md) for installed workspace shape and ownership rules.
3. [manifest-and-managed-files.md](manifest-and-managed-files.md) for managed-file metadata, hashes, and repeat-init behavior.
4. [adapter-contract.md](adapter-contract.md) for provider-neutral source versus adapter-specific output.
5. [performance-library.md](performance-library.md) for hooks, extensions, tools, skills, and reusable assets.
6. [cli-reference.md](cli-reference.md) for command purpose, arguments, gates, and common flows.
7. [testing-and-acceptance.md](testing-and-acceptance.md) for checks that define release readiness.
8. [walkthrough-lifecycle.md](walkthrough-lifecycle.md) for the full local init-to-export loop.
9. [walkthrough-lesson-pack.md](walkthrough-lesson-pack.md) for a low-risk lesson pack example.
10. [walkthrough-parent-email.md](walkthrough-parent-email.md) for a review-gated family communication example.

Sample generated artifacts live in [../examples/sample-outputs](../examples/sample-outputs).

Run `python scripts/quality_check.py` after documentation or contract changes. GitHub Actions runs the same check on pushes and pull requests.

Run `npm run demo:lifecycle` after building the CLI to create an inspectable end-to-end workspace under `/tmp`.

These docs do not replace `PLAN.md`. If they conflict, follow the user's current instruction first, then `PLAN.md`, then these release-facing contracts.
