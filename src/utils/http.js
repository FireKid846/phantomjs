async function httpGet(url, options = {}) {
  try {
    const headers = {};
    if (options.accept) headers['Accept'] = options.accept;

    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return { data: null, error: `HTTP ${res.status}: ${res.statusText}` };

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await res.json()
      : await res.text();

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

module.exports = { httpGet };
