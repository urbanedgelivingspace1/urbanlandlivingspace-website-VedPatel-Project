import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  PublicPropertyCardDto,
  PublicPropertyDetailDto,
} from "@/features/properties/domain/contracts";
import {
  projectPublicPropertyCard,
  projectPublicPropertyDetail,
} from "@/features/properties/queries/public-property-projector";
import type { Database } from "@/types/database";

export async function listPublicPropertyCards(
  client: SupabaseClient<Database>,
  limit = 24,
): Promise<readonly PublicPropertyCardDto[]> {
  const boundedLimit = Math.max(1, Math.min(limit, 60));
  const { data, error } = await client
    .from("public_property_listings")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(boundedLimit);

  if (error) throw error;
  return data.map(projectPublicPropertyCard);
}

export async function getPublicPropertyDetail(
  client: SupabaseClient<Database>,
  slug: string,
): Promise<PublicPropertyDetailDto | null> {
  const { data: property, error: propertyError } = await client
    .from("public_property_details")
    .select("*")
    .eq("public_slug", slug)
    .maybeSingle();
  if (propertyError) throw propertyError;
  if (!property) return null;

  const [{ data: media, error: mediaError }, { data: verifications, error: verificationError }] =
    await Promise.all([
      client
        .from("public_property_media")
        .select("*")
        .eq("property_id", property.id)
        .order("sort_order"),
      client
        .from("public_property_verification_summaries")
        .select("*")
        .eq("property_id", property.id),
    ]);
  if (mediaError) throw mediaError;
  if (verificationError) throw verificationError;

  return projectPublicPropertyDetail(property, media, verifications);
}
