import { BaseRoute, RouteConfig, RequestContext, AuthContext, HttpStatus } from "../../lib/router";
import { UserRole } from "../../models/enums/user-role.enum";

export class MeRoute extends BaseRoute {

  readonly config: RouteConfig = {
    method: "GET",
    path: "/auth/me",
    roles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN]
  };

  async handler({ user, req }: AuthContext): Promise<Response> {


    if (this.param(req, 'picture') === "true") {
      return this.ok(user.picture_url);
    }

    return this.json(HttpStatus.OK, user);
  }
}
