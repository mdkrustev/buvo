import { BaseRoute } from "../lib/router";
import { GoogleLoginRoute  } from "./auth/google-login.route";
import { GoogleCallBackRoute } from "./auth/google-callback.route"
import { MeRoute } from "./auth/me.route";
import { LogoutRoute } from "./auth/logout.route";
import { AssistantRoute } from "./gen/assistant.route";

export const routes: BaseRoute[] = [
  new GoogleLoginRoute(),
  new GoogleCallBackRoute(),
  new MeRoute(),
  new LogoutRoute(),
  new AssistantRoute(),
];