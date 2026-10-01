import "server-only";

import { cache } from "react";
import type {
  PublicPropertyCardDto,
  PublicPropertyDetailDto,
} from "@/features/properties/domain/contracts";
import {
  resolvePublicBusinessConfig,
  unavailablePublicBusinessConfig,
  type PublicBusinessConfig,
} from "@/lib/config/public-business";
import { createPublicServerClient } from "@/server/supabase/public";

import { getPublicPropertyDetail, listPublicPropertyCards } from "./public-properties";
import {
  getPublicAreaUnits,
  getPublicGeographyOptions,
  getPublicSettings,
} from "./public-reference-data";

export type PublicInventoryResult =
  | Readonly<{ status: "ready"; properties: readonly PublicPropertyCardDto[] }>
  | Readonly<{ status: "unavailable"; properties: readonly [] }>;

export async function loadPublicInventory(
  options: Readonly<{
    limit?: number;
    category?: PublicPropertyCardDto["category"];
    transactionType?: PublicPropertyCardDto["transactionType"];
    featuredOnly?: boolean;
  }> = {},
): Promise<PublicInventoryResult> {
  try {
    const client = createPublicServerClient();
    const properties = await listPublicPropertyCards(client, options.limit, options);
    return { status: "ready", properties };
  } catch {
    return { status: "unavailable", properties: [] };
  }
}

export const loadPublicProperty = cache(
  async (slug: string): Promise<PublicPropertyDetailDto | null> => {
    const client = createPublicServerClient();
    return getPublicPropertyDetail(client, slug);
  },
);

export async function loadPublicBusinessConfig(): Promise<PublicBusinessConfig> {
  try {
    const client = createPublicServerClient();
    return resolvePublicBusinessConfig(await getPublicSettings(client));
  } catch {
    return unavailablePublicBusinessConfig();
  }
}

export async function loadPublicFormOptions() {
  const client = createPublicServerClient();
  const [geography, units] = await Promise.all([
    getPublicGeographyOptions(client),
    getPublicAreaUnits(client),
  ]);
  return { geography, units } as const;
}
