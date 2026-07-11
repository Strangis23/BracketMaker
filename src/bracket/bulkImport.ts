export function parseBulkImport(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export interface BulkImportResult {
  imported: number;
  skipped: number;
}
