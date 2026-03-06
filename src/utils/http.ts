import hurl, { HurlError } from '@firekid/hurl'

// Wraps all external HTTP calls Phantom makes.
// Never throws — always returns { data, error } so callers decide what to do.
// This prevents one failing API call from crashing the entire bot.

type HttpResult<T> =
  | { data: T; error: null }
  | { data: null; error: string }

export async function httpGet<T>(
  url: string,
  options: { token?: string; accept?: string } = {}
): Promise<HttpResult<T>> {
  try {
    const headers: Record<string, string> = {}
    if (options.accept) headers['Accept'] = options.accept
    if (options.token) headers['Authorization'] = `Bearer ${options.token}`

    const res = await hurl.get<T>(url, {
      headers,
      timeout: 10000,
      throwOnError: true,
      retry: 2,
    })

    return { data: res.data, error: null }
  } catch (err) {
    if (err instanceof HurlError) {
      return { data: null, error: `HTTP ${err.status ?? 'unknown'}: ${err.message}` }
    }
    return { data: null, error: (err as Error).message }
  }
}
