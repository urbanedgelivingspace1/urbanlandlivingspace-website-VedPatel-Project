export type ActiveAdmin = Readonly<{
  userId: string;
  email: string | null;
  displayName: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "SALES" | "VERIFIER" | "CONTENT_EDITOR";
}>;

export class AdminAuthorizationError extends Error {
  constructor(readonly reason: "NO_SESSION" | "NOT_ACTIVE_ADMIN") {
    super("Active admin authorization required.");
    this.name = "AdminAuthorizationError";
  }
}

export type AdminIdentity = Readonly<{ id: string; email?: string }>;
export type AdminProfile = Readonly<{
  user_id: string;
  display_name: string;
  role: ActiveAdmin["role"];
  is_active: boolean;
}>;

export function authorizeAdminIdentity(
  identity: AdminIdentity | null,
  profile: AdminProfile | null,
): ActiveAdmin {
  if (!identity) throw new AdminAuthorizationError("NO_SESSION");
  if (!profile || !profile.is_active || profile.user_id !== identity.id) {
    throw new AdminAuthorizationError("NOT_ACTIVE_ADMIN");
  }
  return {
    userId: identity.id,
    email: identity.email ?? null,
    displayName: profile.display_name,
    role: profile.role,
  };
}
