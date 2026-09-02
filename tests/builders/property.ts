export type SyntheticProperty = Readonly<{
  propertyCode: string;
  publicTitle: string;
  isSynthetic: true;
}>;

export function buildSyntheticProperty(
  override: Partial<SyntheticProperty> = {},
): SyntheticProperty {
  return {
    propertyCode: "UE-LS-TEST-000001",
    publicTitle: "Synthetic test land — not production inventory",
    isSynthetic: true,
    ...override,
  };
}
