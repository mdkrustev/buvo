import { createRouter } from "./lib/router";
import { routes } from "./routes";
import { MyDurableObject } from "./durable/my-do";
import { env } from "cloudflare:workers";

let router: ReturnType<typeof createRouter> | null = null;

function getRouter() {
  if (!router) {
    router = createRouter(routes);
  }
  return router;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': env.FRONTEND_URL,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
};

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(req.url);

    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const routerInstance = getRouter();
    
    let response = await routerInstance(req, env, ctx);

    const newHeaders = new Headers(response.headers);
    
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};

export { MyDurableObject };