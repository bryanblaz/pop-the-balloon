export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Try to serve a static asset first
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse && assetResponse.status !== 404) return assetResponse;

    // Fallback dynamic route
    return new Response("Hello from Worker + Assets!", {
      headers: { "content-type": "text/plain" },
    });
  }
} satisfies ExportedHandler;

// Wrangler injects the ASSETS binding when "assets.directory" is set
interface Env {
  ASSETS: Fetcher;
}
