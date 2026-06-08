import { BaseRoute, RouteConfig, RequestContext } from "../../lib/router";

export class GoogleCallBackRoute extends BaseRoute {
  readonly config: RouteConfig = {
    path: "/auth/google/callback",
    method: "GET",
  };

  // ✅ Unicode-safe base64 encode (Cloudflare Workers compatible)
  private base64Encode(str: string): string {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async handler({ req, env }: RequestContext): Promise<Response> {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return new Response("Missing code", { status: 400 });
    }

    console.log("SECRET EXISTS", !!env.GOOGLE_CLIENT_SECRET);
    console.log("ENV KEYS", Object.keys(env));
    //return new Response("secret:" + env.GOOGLE_CLIENT_SECRET, {status: 200})

    // exchange code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${env.BASE_URL}/auth/google/callback`,
      }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      return new Response(`Token error: ${text}`, { status: 500 });
    }

    const tokenData: any = await tokenRes.json();

    // get user info from Google
    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    if (!userRes.ok) {
      const text = await userRes.text();
      return new Response(`User info error: ${text}`, { status: 500 });
    }

    const googleUser: any = await userRes.json();

    let userId: number;

    try {
      const now = new Date().toISOString();

      const test = await env.DB.prepare(
        "SELECT 1 as test"
      ).first();

      const existing = await env.DB.prepare(
        `SELECT id FROM users WHERE google_id = ? OR email = ?`
      )
        .bind(googleUser.id, googleUser.email)
        .first<{ id: number }>();
      if (existing) {
        await env.DB.prepare(
          `UPDATE users 
           SET name = ?, google_id = ?, picture_url = ?, login_at = ?
           WHERE id = ?`
        )
          .bind(googleUser.name, googleUser.id, googleUser.picture, now, existing.id)
          .run();

        userId = existing.id;
      } else {
        const res = await env.DB.prepare(
          `INSERT INTO users (email, name, google_id, picture_url, login_at) 
           VALUES (?, ?, ?, ?, ?)`
        )
          .bind(
            googleUser.email,
            googleUser.name,
            googleUser.id,
            googleUser.picture,
            now
          )
          .run();

        userId = Number(res.meta.last_row_id);
      }
    } catch (err) {
      return new Response(`DB error: ${err}`, { status: 500 });
    }

    // create session token
    const payload = JSON.stringify({
      id: userId,
      email: googleUser.email,
      name: googleUser.name,
    });

    const sessionToken = this.base64Encode(payload);

    const cookie = `session=${sessionToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${60 * 60 * 24 * 7
      }`;

    const frontendUrl =
      env.FRONTEND_URL || "http://localhost:5173";

    const html = `
      <!DOCTYPE html>
      <html>
        <body>
          <script>
            const token = "${sessionToken}";
            if (window.opener) {
              window.opener.postMessage(
                { type: "AUTH_SUCCESS", token },
                "${frontendUrl}"
              );
              window.close();
            } else {
              document.body.innerText = "Authentication successful. You can close this tab.";
            }
          </script>
        </body>
      </html>
    `;

    const response = new Response(html, {
      headers: { "Content-Type": "text/html" },
    });

    response.headers.append("Set-Cookie", cookie);

    return response;
  }
}
