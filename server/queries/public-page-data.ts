import "server-only";

import { unstable_cache } from "next/cache";
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

const loadCachedPublicInventory = unstable_cache(
  async (
    options: Readonly<{
      limit?: number;
      category?: PublicPropertyCardDto["category"];
      transactionType?: PublicPropertyCardDto["transactionType"];
      featuredOnly?: boolean;
    }>,
  ): Promise<PublicInventoryResult> => {
    try {
      const client = createPublicServerClient();
      const properties = await listPublicPropertyCards(client, options.limit, options);
      return { status: "ready", properties };
    } catch {
      return { status: "unavailable", properties: [] };
    }
  },
  ["public-inventory"],
  { revalidate: 60, tags: ["public-properties"] },
);

export function loadPublicInventory(
  options: Readonly<{
    limit?: number;
    category?: PublicPropertyCardDto["category"];
    transactionType?: PublicPropertyCardDto["transactionType"];
    featuredOnly?: boolean;
  }> = {},
): Promise<PublicInventoryResult> {
  return loadCachedPublicInventory(options);
}

export const loadPublicProperty = cache(
  unstable_cache(
    async (slug: string): Promise<PublicPropertyDetailDto | null> => {
      const client = createPublicServerClient();
      return getPublicPropertyDetail(client, slug);
    },
    ["public-property"],
    { revalidate: 60, tags: ["public-properties"] },
  ),
);

export const loadPublicBusinessConfig = unstable_cache(
  async (): Promise<PublicBusinessConfig> => {
    try {
      const client = createPublicServerClient();
      return resolvePublicBusinessConfig(await getPublicSettings(client));
    } catch {
      return unavailablePublicBusinessConfig();
    }
  },
  ["public-business-config"],
  { revalidate: 300, tags: ["public-business-config"] },
);

export const loadPublicFormOptions = unstable_cache(
  async () => {
    const client = createPublicServerClient();
    const [geography, units] = await Promise.all([
      getPublicGeographyOptions(client),
      getPublicAreaUnits(client),
    ]);
    return { geography, units } as const;
  },
  ["public-form-options"],
  { revalidate: 600, tags: ["public-reference-data"] },
);
