const DICTIONARY_API_BASE = "https://api.dictionaryapi.dev/api/v2/entries";

export async function lookupWord(word: string, lang = 'en') {
  const safe = encodeURIComponent(word.trim());
  const url = `${DICTIONARY_API_BASE}/${lang}/${safe}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error('Lookup failed');
  }
  const data = await resp.json();
  // dictionaryapi.dev returns an array; normalize to first entry
  const entry = Array.isArray(data) && data.length > 0 ? data[0] : data;
  return entry;
}

import { ENV } from '@/share/utils/env';

export async function saveVocab(payload: { word: string; data?: any }) {
  // Calls backend endpoint to save vocabulary. Use configured API_URL so request goes to backend server.
  const base = ENV.API_URL.replace(/\/$/, '');
  const url = `${base}/vocab`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || 'Save failed');
  }
  return resp.json();
}

export default { lookupWord, saveVocab };
