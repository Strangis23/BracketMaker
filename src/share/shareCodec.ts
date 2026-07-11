import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { SharedBracketPayload } from './buildSharePayload';

const SHARE_PREFIX = '#share=';

export function encodeSharePayload(payload: SharedBracketPayload): string {
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeSharePayload(encoded: string): SharedBracketPayload | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;

    const parsed = JSON.parse(json) as SharedBracketPayload;
    if (parsed.version !== 1 || !parsed.template || !Array.isArray(parsed.runs)) {
      return null;
    }
    if (parsed.runs.length === 0) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function buildShareUrl(payload: SharedBracketPayload): string {
  const encoded = encodeSharePayload(payload);
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${window.location.origin}${basePath}#share=${encoded}`;
}

export function readSharePayloadFromLocation(): SharedBracketPayload | null {
  const hash = window.location.hash;
  if (!hash.startsWith(SHARE_PREFIX)) return null;
  return decodeSharePayload(hash.slice(SHARE_PREFIX.length));
}

export function clearShareFromLocation(): void {
  if (window.location.hash.startsWith(SHARE_PREFIX)) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

export function copyShareUrl(url: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(url);
  }

  const input = document.createElement('textarea');
  input.value = url;
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  return Promise.resolve();
}
