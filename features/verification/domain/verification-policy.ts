import type { LandCategory, TransactionType } from "@/types/database";

import type { EvidenceProvenance, VerificationSourceClass, VerificationStatus } from "./contracts";

const provenanceRank: Record<EvidenceProvenance, number> = {
  RECEIVED: 1,
  REVIEWED: 2,
  SOURCE_VERIFIED: 3,
  PROFESSIONALLY_REVIEWED: 4,
  SUPERSEDED: 0,
  REVOKED: 0,
};

const unsafePublicClaims = [
  "clear title",
  "100% clear title",
  "legally verified",
  "government approved",
  "fully verified",
  "dispute free",
  "guaranteed na",
  "guaranteed construction",
  "risk free",
  "no legal issues",
] as const;

export type DefinitionCandidate = Readonly<{
  code: string;
  categoryScope: LandCategory | null;
  transactionScope: TransactionType | null;
  lawyerRequired: boolean;
  surveyorRequired: boolean;
  defaultRequired: boolean;
}>;

export function isDefinitionApplicable(
  definition: DefinitionCandidate,
  property: Readonly<{ category: LandCategory; transactionType: TransactionType }>,
) {
  return (
    (!definition.categoryScope || definition.categoryScope === property.category) &&
    (!definition.transactionScope || definition.transactionScope === property.transactionType)
  );
}

export function resolveVerificationPlan(
  definitions: readonly DefinitionCandidate[],
  property: Readonly<{ category: LandCategory; transactionType: TransactionType }>,
) {
  const applicable = definitions.filter((definition) =>
    isDefinitionApplicable(definition, property),
  );
  return {
    requiredChecks: applicable
      .filter((definition) => definition.defaultRequired)
      .map(({ code }) => code),
    conditionalChecks: applicable
      .filter((definition) => !definition.defaultRequired)
      .map(({ code }) => code),
    professionalTriggers: applicable.flatMap((definition) => [
      ...(definition.lawyerRequired
        ? [{ checkCode: definition.code, type: "LAWYER" as const }]
        : []),
      ...(definition.surveyorRequired
        ? [{ checkCode: definition.code, type: "SURVEYOR" as const }]
        : []),
    ]),
  };
}

export function isEvidenceEligible(
  input: Readonly<{
    provenance: EvidenceProvenance;
    requiredProvenance: EvidenceProvenance;
    archived: boolean;
    scanStatus?: "PENDING" | "CLEAN" | "INFECTED" | "FAILED" | null;
  }>,
) {
  return (
    !input.archived &&
    (input.scanStatus === undefined || input.scanStatus === null || input.scanStatus === "CLEAN") &&
    provenanceRank[input.provenance] >= provenanceRank[input.requiredProvenance]
  );
}

export function publicStatusFor(status: VerificationStatus) {
  if (status === "PASSED") return "COMPLETED" as const;
  if (status === "PASSED_WITH_NOTE") return "COMPLETED_WITH_NOTE" as const;
  if (status === "EXPIRED") return "STALE" as const;
  if (status === "REQUIRES_REVIEW" || status === "FAILED") return "REQUIRES_REVIEW" as const;
  return "NOT_REVIEWED" as const;
}

export function assertSafePublicVerificationCopy(
  input: Readonly<{
    label: string;
    explanation: string;
    scope: string;
    limitation: string;
    sourceClass: VerificationSourceClass;
  }>,
) {
  const combined = `${input.label} ${input.explanation}`.toLowerCase();
  const unsafe = unsafePublicClaims.find((claim) => combined.includes(claim));
  if (unsafe) throw new Error(`Unsafe public verification claim: ${unsafe}`);
  if (input.scope.trim().length < 20) throw new Error("Public verification scope is too broad.");
  if (input.limitation.trim().length < 10)
    throw new Error("Public verification limitation is required.");
  return {
    label: input.label.trim(),
    explanation: input.explanation.trim(),
    scope: input.scope.trim(),
    limitation: input.limitation.trim(),
    sourceClass: input.sourceClass,
  };
}

export function formatScopeAndLimitation(scope: string, limitation: string) {
  return `${scope.trim()} Limitation: ${limitation.trim()}`;
}
