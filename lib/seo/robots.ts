export type IndexPolicy = Readonly<{ index: boolean; follow: boolean }>;
export const INDEX_FOLLOW: IndexPolicy = { index: true, follow: true };
export const NOINDEX_FOLLOW: IndexPolicy = { index: false, follow: true };
export const NOINDEX_NOFOLLOW: IndexPolicy = { index: false, follow: false };

export function isProductionIndexable(environment = process.env.APP_ENV): boolean {
  return environment === "production";
}

export function effectiveRobots(policy: IndexPolicy, environment = process.env.APP_ENV) {
  return isProductionIndexable(environment) ? policy : NOINDEX_NOFOLLOW;
}
