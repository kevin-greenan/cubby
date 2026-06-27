# Cubby Development Docs

These documents help coding agents implement Cubby from the current plan toward MVP and v1.

Read order for implementation work:

1. [../PLAN.md](../PLAN.md) for product scope, milestones, and source-of-truth requirements.
2. [mvp-implementation-guide.md](mvp-implementation-guide.md) for the first build sequence.
3. [workspace-contract.md](workspace-contract.md) for installed workspace shape and ownership rules.
4. [manifest-and-managed-files.md](manifest-and-managed-files.md) for managed-file metadata, hashes, and repeat-init behavior.
5. [adapter-contract.md](adapter-contract.md) for provider-neutral source versus adapter-specific output.
6. [performance-library.md](performance-library.md) for the long-term hooks, extensions, tools, skills, and reusable assets that make Cubby high-performing.
7. [testing-and-acceptance.md](testing-and-acceptance.md) for checks that define MVP readiness.
8. [walkthrough-lesson-pack.md](walkthrough-lesson-pack.md) for a low-risk lesson pack example.
9. [walkthrough-parent-email.md](walkthrough-parent-email.md) for a review-gated family communication example.

Run `python scripts/quality_check.py` after documentation or contract changes. GitHub Actions runs the same check on pushes and pull requests.

These docs do not replace `PLAN.md`. If they conflict, follow the user's current instruction first, then `PLAN.md`, then these docs.
