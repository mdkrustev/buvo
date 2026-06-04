import { UserRole } from "../models/enums/user-role.enum";
import type { UserEntity } from "../models/db/user.entity";

/* -------------------------------------------------- */
/* HTTP STATUS ENUM                                   */
/* -------------------------------------------------- */

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,

  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,

  INTERNAL_SERVER_ERROR = 500,
}

/* -------------------------------------------------- */
/* Types                                              */
/* -------------------------------------------------- */

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type RouteConfig = {
  path: string;
  method: HttpMethod;
  roles?: UserRole[];
};

export type RequestContext = {
  req: Request;
  env: Env;
  ctx: ExecutionContext;
};

export type AuthContext = RequestContext & {
  user: UserEntity;
};

/* -------------------------------------------------- */
/* Base Route                                         */
/* -------------------------------------------------- */

export abstract class BaseRoute<TContext = RequestContext> {
  abstract readonly config: RouteConfig;

  get path(): string {
    return this.config.path;
  }

  get method(): HttpMethod {
    return this.config.method;
  }

  /* -------------------- JSON Helper -------------------- */

  protected json(status: HttpStatus, data: unknown, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
  });
}

  /* -------------------- Shortcut Helpers -------------------- */

  protected ok(data: unknown) {
    return this.json(HttpStatus.OK, data);
  }

  protected created(data: unknown) {
    return this.json(HttpStatus.CREATED, data);
  }

  protected badRequest(message: string) {
    return this.json(HttpStatus.BAD_REQUEST, { message });
  }

  protected unauthorized() {
    return new Response("Unauthorized", {
      status: HttpStatus.UNAUTHORIZED,
    });
  }

  protected forbidden() {
    return new Response("Forbidden", {
      status: HttpStatus.FORBIDDEN,
    });
  }

  protected empty() {
    return new Response(null, {
      status: HttpStatus.NO_CONTENT,
    });
  }

  abstract handler(context: TContext): Promise<Response> | Response;
}

/* -------------------------------------------------- */
/* Router Factory                                     */
/* -------------------------------------------------- */

export function createRouter(routes: BaseRoute<any>[]) {
  return async function router(
    req: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(req.url);

    for (const route of routes) {
      if (
        route.method === req.method &&
        route.path === url.pathname
      ) {
        const baseContext: RequestContext = { req, env, ctx };

        // 🔒 Protected route
        if (route.config.roles && route.config.roles.length > 0) {
          const session = getSessionFromCookie(req);

          if (!session) {
            return new Response("Unauthorized", {
              status: HttpStatus.UNAUTHORIZED,
            });
          }

          let payload: any;

          try {
            payload = decodeSession(session);
          } catch {
            return new Response("Unauthorized", {
              status: HttpStatus.UNAUTHORIZED,
            });
          }

          const dbUser = await env.DB.prepare(
            `SELECT * FROM users WHERE id = ?`
          )
            .bind(payload.id)
            .first<UserEntity>();

          if (!dbUser) {
            return new Response("Unauthorized", {
              status: HttpStatus.UNAUTHORIZED,
            });
          }

          if (!hasAccess(dbUser.role, route.config.roles)) {
            return new Response("Forbidden", {
              status: HttpStatus.FORBIDDEN,
            });
          }

          const authContext: AuthContext = {
            ...baseContext,
            user: dbUser,
          };

          return route.handler(authContext);
        }

        // 🌍 Public route
        return route.handler(baseContext);
      }
    }

    return new Response("Not Found", {
      status: HttpStatus.NOT_FOUND,
    });
  };
}

/* -------------------------------------------------- */
/* Role Logic (Dynamic based on enum order)           */
/* -------------------------------------------------- */

const ROLE_ORDER = Object.values(UserRole);

function hasAccess(
  userRole: UserRole,
  requiredRoles: UserRole[]
): boolean {
  const userIndex = ROLE_ORDER.indexOf(userRole);

  return requiredRoles.some((required) => {
    const requiredIndex = ROLE_ORDER.indexOf(required);
    return userIndex >= requiredIndex;
  });
}

/* -------------------------------------------------- */
/* Session Helpers                                    */
/* -------------------------------------------------- */

function getSessionFromCookie(req: Request): string | null {
  const cookie = req.headers.get("Cookie");
  if (!cookie) return null;

  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

function decodeSession(token: string) {
  const decoded = atob(token);
  return JSON.parse(decoded);
}
