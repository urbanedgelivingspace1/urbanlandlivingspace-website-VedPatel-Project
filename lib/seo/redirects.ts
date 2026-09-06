export function isSafeRedirectPath(path: string): boolean {
  return /^\/[a-z0-9][a-z0-9/-]*$/.test(path) && !path.includes("//") && !/[?#]/.test(path);
}

export function flattenRedirects(
  records: readonly Readonly<{ sourcePath: string; destinationPath: string }>[],
  sourcePath: string,
  destinationPath: string,
) {
  return records.map((record) => ({
    ...record,
    destinationPath:
      record.destinationPath === sourcePath ? destinationPath : record.destinationPath,
  }));
}
