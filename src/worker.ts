interface AssetFetcher {
  fetch: (request: Request) => Promise<Response>
}

interface Env {
  ASSETS: AssetFetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/health' || url.pathname === '/api/health') {
      return new Response(JSON.stringify({ ok: true }), {
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
        },
      })
    }

    return env.ASSETS.fetch(request)
  },
}
