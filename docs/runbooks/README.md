# Runbooks

Operational runbooks will be added in their roadmap milestone. Required subjects include local setup, migrations, seed/test safety, storage reconciliation, backup/restore, release, rollback, provider outage, security incident and production smoke checks.

Implemented runbooks:

- `local-development.md` — isolated local stack and guarded test workflow.
- `m17-security-hardening.md` — M17 findings, actor/resource matrix, hostile-path evidence, accepted risks and production-only security gates.
- `m18-final-qa.md` — clean-state whole-system qualification, exhaustive Definition-of-Done reconciliation, release evidence and M19/pre-launch transfer.
- `m19-deployment-preparation.md` — environment/provider contract, staging and production procedures,
  migration/storage/admin steps, restore evidence, rollback/DNS/operations plans and the reconciled
  launch-gate register.

No runbook may authorize production deployment, DNS changes, production migrations, destructive production operations, real private-data import or paid-service activation without explicit owner approval.
