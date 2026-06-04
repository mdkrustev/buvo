import { DurableObject } from "cloudflare:workers";

export class MyDurableObject extends DurableObject<Env> {
  async fetch(req: Request) {
    return new Response("Hello from DO");
  }
}