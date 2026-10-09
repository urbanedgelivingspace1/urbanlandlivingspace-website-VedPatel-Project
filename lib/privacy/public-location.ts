import type { PublicLocationDto } from "@/features/properties/domain/contracts";
import type { LocationVisibility } from "@/types/database";

/** This source type intentionally has no private coordinate fields. */
export type PublicLocationSource = Readonly<{
  visibility: LocationVisibility;
  publicLatitude: number | null;
  publicLongitude: number | null;
  publicAccuracyMetres: number | null;
  districtName: string;
  subdistrictName: string | null;
  placeName: string | null;
  localityName: string | null;
  publicAddress: string | null;
}>;

function broadLabel(source: PublicLocationSource): string {
  return [source.localityName, source.placeName, source.subdistrictName, source.districtName]
    .filter((value): value is string => Boolean(value))
    .join(", ");
}

export function projectPublicLocation(source: PublicLocationSource): PublicLocationDto {
  if (source.visibility === "HIDDEN") {
    return { visibility: "HIDDEN", label: broadLabel(source), point: null };
  }

  return {
    visibility: source.visibility,
    label: source.publicAddress || broadLabel(source),
    point: null,
  };
}
