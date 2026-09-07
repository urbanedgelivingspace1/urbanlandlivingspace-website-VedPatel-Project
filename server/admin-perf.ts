export type AdminPerfTiming = Readonly<{
  route: string;
  authMs?: number;
  dataMs?: number;
  totalMs?: number;
  getUserMs?: number;
  adminAuthMs?: number;
}>;

export function logAdminPerf(timing: AdminPerfTiming): void {
  // Safe server performance log: strictly excludes tokens, cookies, API keys, passwords, PII, coordinates, or documents
  console.info("admin_perf", {
    route: timing.route,
    ...(timing.authMs !== undefined ? { authMs: Math.round(timing.authMs) } : {}),
    ...(timing.dataMs !== undefined ? { dataMs: Math.round(timing.dataMs) } : {}),
    ...(timing.totalMs !== undefined ? { totalMs: Math.round(timing.totalMs) } : {}),
    ...(timing.getUserMs !== undefined ? { getUserMs: Math.round(timing.getUserMs) } : {}),
    ...(timing.adminAuthMs !== undefined ? { adminAuthMs: Math.round(timing.adminAuthMs) } : {}),
  });
}

export async function measureAdminPerf<T>(route: string, fetcher: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const result = await fetcher();
  const dataMs = performance.now() - start;
  logAdminPerf({ route, dataMs, totalMs: dataMs });
  return result;
}
