const DICTIONARY_API_BASE = "https://api.dictionaryapi.dev/api/v2/entries";

export async function lookupWord(word: string, lang = 'en') {
  const safe = encodeURIComponent(word.trim());
  const url = `${DICTIONARY_API_BASE}/${lang}/${safe}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error('Lookup failed');
  }
  const data = await resp.json();
  const entry = Array.isArray(data) && data.length > 0 ? data[0] : data;
  return entry;
}

export default { lookupWord };
