import { Hono } from "https://deno.land/x/hono@v3.3.0/mod.ts";

export default function (app: Hono) {
  app.get("/api/user", (c) => c.text("hello"));
}
