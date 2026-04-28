const rawBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

// Default to the API gateway exposed on the host during docker demo runs.
export const apiBase = rawBase.trim().length > 0 ? rawBase : "http://localhost:4000";

export async function parseApiError(res: Response, url: string) {
  const body = await res.text().catch(() => "");
  // eslint-disable-next-line no-console
  console.error("api_request_failed", { url, status: res.status, statusText: res.statusText, body });
  return body;
}

