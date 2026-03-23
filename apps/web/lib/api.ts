const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export async function getCategories() {
  return apiFetch<any[]>('/categories');
}

export async function getTools(params?: Record<string, string | number>) {
  const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
  return apiFetch<any>(`/tools${qs}`);
}

export async function getToolBySlug(slug: string) {
  return apiFetch<any>(`/tools/${slug}`);
}

export async function getTopTools(limit = 10) {
  return apiFetch<any[]>(`/tools/top?limit=${limit}`);
}

export async function getTodayCase() {
  return apiFetch<any>('/cases/daily');
}

export async function listCases(params?: Record<string, string | number>) {
  const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
  return apiFetch<any>(`/cases${qs}`);
}

export async function getScenarios() {
  return apiFetch<string[]>('/cases/scenarios');
}

export async function searchTools(q: string, page = 1) {
  return apiFetch<any>(`/search?q=${encodeURIComponent(q)}&page=${page}`);
}

export async function getClawTools(page = 1) {
  return apiFetch<any>(`/claw?page=${page}`);
}

export async function getClawFeatured() {
  return apiFetch<any[]>('/claw/featured');
}

export async function getCategoryBySlug(slug: string) {
  return apiFetch<any>(`/categories/${slug}`);
}

export async function getAdSlot(code: string) {
  try {
    return apiFetch<any>(`/ads/slot/${code}`);
  } catch {
    return null;
  }
}
