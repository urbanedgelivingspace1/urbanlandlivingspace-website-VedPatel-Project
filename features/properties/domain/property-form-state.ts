export type PropertyFormState = Readonly<{
  ok: boolean;
  message: string;
  errors: Readonly<Record<string, readonly string[]>>;
  values: Readonly<Record<string, string>>;
}>;

export const initialPropertyFormState: PropertyFormState = {
  ok: false,
  message: "",
  errors: {},
  values: {},
};
