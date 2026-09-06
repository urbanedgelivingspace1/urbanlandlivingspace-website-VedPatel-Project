import type { LandCategory } from "@/types/database";

export type OwnerDuplicateSubject = Readonly<{
  id: string;
  partyId: string;
  districtId: string | null;
  landCategory: LandCategory;
  areaValue: number | null;
  surveyReference?: string | null;
  blockReference?: string | null;
}>;

function normalizedParcelReference(value: string | null | undefined) {
  return (
    value
      ?.normalize("NFKC")
      .toUpperCase()
      .replaceAll(/[^A-Z0-9]/g, "") || null
  );
}

export function ownerDuplicateSignals(
  subject: OwnerDuplicateSubject,
  candidate: OwnerDuplicateSubject,
): readonly string[] {
  if (subject.id === candidate.id) return [];
  const signals: string[] = [];
  if (subject.partyId === candidate.partyId) signals.push("Same owner/contact");
  const subjectReferences = [subject.surveyReference, subject.blockReference]
    .map(normalizedParcelReference)
    .filter(Boolean);
  const candidateReferences = [candidate.surveyReference, candidate.blockReference]
    .map(normalizedParcelReference)
    .filter(Boolean);
  if (subjectReferences.some((reference) => candidateReferences.includes(reference)))
    signals.push("Same survey/block reference");
  if (subject.districtId && subject.districtId === candidate.districtId)
    signals.push("Same district");
  if (subject.landCategory === candidate.landCategory) signals.push("Same land type");
  if (subject.areaValue && candidate.areaValue) {
    const relativeDifference =
      Math.abs(subject.areaValue - candidate.areaValue) /
      Math.max(subject.areaValue, candidate.areaValue);
    if (relativeDifference <= 0.1) signals.push("Similar area");
  }
  return signals;
}

export function isPotentialOwnerDuplicate(signals: readonly string[]) {
  return (
    signals.includes("Same owner/contact") ||
    signals.includes("Same survey/block reference") ||
    (signals.includes("Same district") &&
      signals.includes("Same land type") &&
      signals.includes("Similar area"))
  );
}
