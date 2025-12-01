import apiClient from './api';

export async function askAi(prompt: string): Promise<{ answer: any }> {
  // Derive backend root from NEXT_PUBLIC_API_URL (which is usually http://localhost:8080/api/v1)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
  const root = apiUrl.replace(/\/api\/v1\/?$/, '');

  try {
    const resp = await apiClient.post(`${root}/api/ai/ask`, { prompt }, { headers: { 'Content-Type': 'application/json' }, skipGlobalLoader: true });
    return resp.data as { answer: any };
  } catch (e: any) {
    // Re-throw a normalized error
    const msg = e?.response?.data ? JSON.stringify(e.response.data) : e?.message || 'Unknown error';
    throw new Error(`AI request failed: ${msg}`);
  }
}
