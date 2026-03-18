/**
 * Base fetch wrapper — injects x-site-context header on every request
 * and reads the API base URL from runtime config.
 */
export function useApi() {
  const config = useRuntimeConfig()
  const siteContext = useState<string>('siteContext')

  async function apiFetch<T>(path: string, opts: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    return $fetch<T>(path, {
      baseURL: config.public.apiBase,
      headers: {
        'x-site-context': siteContext.value,
        ...(opts.headers as Record<string, string> | undefined),
      },
      ...opts,
    })
  }

  return { apiFetch }
}
