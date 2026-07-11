import type { BracketRun, BracketTemplate, StorageData } from '../types';

const STORAGE_KEY = 'bracket-maker-data';

function createEmptyStorage(): StorageData {
  return { version: 1, templates: [], runs: [] };
}

export function loadStorage(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyStorage();
    const parsed = JSON.parse(raw) as StorageData;
    if (parsed.version !== 1 || !Array.isArray(parsed.templates) || !Array.isArray(parsed.runs)) {
      return createEmptyStorage();
    }
    return parsed;
  } catch {
    return createEmptyStorage();
  }
}

export function saveStorage(data: StorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function upsertTemplate(template: BracketTemplate): BracketTemplate[] {
  const data = loadStorage();
  const index = data.templates.findIndex((item) => item.id === template.id);
  if (index >= 0) {
    data.templates[index] = template;
  } else {
    data.templates.unshift(template);
  }
  saveStorage(data);
  return data.templates;
}

export function saveRun(run: BracketRun): BracketRun[] {
  const data = loadStorage();
  const index = data.runs.findIndex((item) => item.id === run.id);
  if (index >= 0) {
    data.runs[index] = run;
  } else {
    data.runs.unshift(run);
  }
  saveStorage(data);
  return data.runs;
}

export function getTemplate(id: string): BracketTemplate | null {
  return loadStorage().templates.find((template) => template.id === id) ?? null;
}

export function getRun(id: string): BracketRun | null {
  return loadStorage().runs.find((run) => run.id === id) ?? null;
}

export function getRunsForTemplate(templateId: string): BracketRun[] {
  return loadStorage()
    .runs.filter((run) => run.templateId === templateId)
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? b.startedAt).getTime() -
        new Date(a.completedAt ?? a.startedAt).getTime()
    );
}

export function deleteTemplate(templateId: string): void {
  const data = loadStorage();
  data.templates = data.templates.filter((template) => template.id !== templateId);
  data.runs = data.runs.filter((run) => run.templateId !== templateId);
  saveStorage(data);
}

export function deleteRun(runId: string): void {
  const data = loadStorage();
  data.runs = data.runs.filter((run) => run.id !== runId);
  saveStorage(data);
}

export function createId(): string {
  return crypto.randomUUID();
}
