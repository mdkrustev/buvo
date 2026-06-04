import { BaseRoute, RouteConfig, RequestContext, AuthContext, HttpStatus } from "../../lib/router";
import { UserRole } from "../../models/enums/user-role.enum";

export class MeRoute extends BaseRoute {

  readonly config: RouteConfig = {
    method: "GET",
    path: "/auth/me",
    roles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN]  
  };

  async handler({ user }: AuthContext): Promise<Response> {


    return this.json(HttpStatus.OK, user);
  }
}
