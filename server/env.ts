import "server-only";

import { serverEnvironmentSchema, type ServerEnvironment } from "@/config/environment-schema";

let cachedEnvironment: ServerEnvironment | undefined;

export function getServerEnvironment(): ServerEnvironment {
  cachedEnvironment ??= serverEnvironmentSchema.parse(process.env);
  return cachedEnvironment;
}
