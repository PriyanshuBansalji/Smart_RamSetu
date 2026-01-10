# Contributing Guide — RamSetu Health Bridge

Thank you for contributing! This file explains how contributors should work so that every team member's code is visible in the repository history and easy to review.

## Team
- Team Lead: Priyanshu Bansal
- Rajat Sisodia
- Shreya Jain
- Pakhi Morya

Each team member must make code changes using their own GitHub account so contributions appear in commit history and on PRs. Do not share one account for multiple authors.

## Basic rules
- Work on a feature branch (do not commit directly to `main`). Branch naming convention: `feature/<issue-number>-short-desc` or `fix/<issue-number>-short-desc`.
- Open a Pull Request (PR) for every change. PRs must be reviewed and merged via the GitHub UI or CI-validated merge.
- Link PRs to an issue when relevant and include a clear description of the change.

## Commit messages
Use Conventional Commits style to make repository history consistent and machine-readable:

```
<type>(scope?): subject

body (optional)

footer (optional)
```

Common types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`.

Example:

```
feat(match): add urgency predictor to heart model

Adds a new feature to compute urgency score used by the Match Engine.

Closes #42
```

If multiple authors worked on a commit, include trailer lines (or create separate commits):

```
Co-authored-by: Name <name@example.com>
```

## Pull Request process
- Title: concise and prefixed (e.g., `feat(match): add batch scoring endpoint`).
- Description should include: what changed, why, linked issue, testing performed, and which files to review.
- Checklist (use the PR template):
  - [ ] Code compiles and tests pass
  - [ ] Linting completed
  - [ ] Documentation updated (if applicable)
  - [ ] Author name/email configured and commits made under individual account

## Code review & approvals
- Assign at least one reviewer from the team before merging.
- Address review comments in follow-up commits or update PR description.
- Merge when all required checks pass and reviewers approve.

## Areas of responsibility (suggested)
- `server/` — backend API (assign to Team Lead / backend owner)
- `src/` — frontend (assign to frontend owner)
- `ml_hybrid_module/` — ML code and models (assign to ML owner)

Map responsibilities to `CODEOWNERS` so PRs touching files request the proper reviewers (see `CODEOWNERS` file for placeholders).

## Verifying contribution visibility
- Ensure `git config user.name` and `git config user.email` are set to your GitHub account values before committing.
- Check contributions with:

```bash
git log --author="Your Name"
```

Or on GitHub: PRs and commit history show the author and account.

## CI, tests, and quality gates
- All PRs should run CI (unit tests, lint, basic build). Configure required checks in repository settings.
- Add tests for new logic; do not merge without tests for critical features.

## Large files & models
- Do not commit large model artifacts (>50 MB) to git — use Git LFS or upload to artifact storage (S3, GCS) and reference them.

## Security & sensitive data
- Never commit secrets or credentials. Use environment variables or secrets stores.

## Disputes and guidance
- If there's disagreement about design, create an issue and discuss; escalate to the team lead if required.

---
If you want, I can configure a PR template, CODEOWNERS (placeholders created here), and a short `TEAM.md` listing each member and suggested ownership areas.
