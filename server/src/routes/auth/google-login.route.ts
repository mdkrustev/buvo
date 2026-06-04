import { BaseRoute, RouteConfig, RequestContext } from "../../lib/router";

export class GoogleLoginRoute extends BaseRoute {
  readonly config: RouteConfig = {
    path: "/auth/google/login",
    method: "GET",
  };

  async handler({ env }: RequestContext): Promise<Response> {
    const redirect = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth"
    );

    redirect.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
    redirect.searchParams.set(
      "redirect_uri",
      `${env.BASE_URL}/auth/google/callback`
    );
    redirect.searchParams.set("response_type", "code");
    redirect.searchParams.set("scope", "openid email profile");
    redirect.searchParams.set("prompt", "select_account");

    return Response.redirect(redirect.toString(), 302);
  }
}
