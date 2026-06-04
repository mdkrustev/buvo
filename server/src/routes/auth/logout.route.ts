import { BaseRoute, RouteConfig, AuthContext, HttpStatus } from "../../lib/router";

export class LogoutRoute extends BaseRoute {

  readonly config: RouteConfig = {
    method: "POST",
    path: "/auth/logout",
  };

  async handler({ user }: AuthContext): Promise<Response> {
    
    const deleteCookie = [
      "session=",
      "HttpOnly",
      "Secure",
      "SameSite=None",
      "Path=/",
      "Max-Age=0",
      "Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    ].join("; ");

    return this.json(
      HttpStatus.OK, 
      { 
        success: true, 
        message: "Logged out successfully",
        user: null
      },
      {
        "Set-Cookie": deleteCookie
      }
    );
  }
}