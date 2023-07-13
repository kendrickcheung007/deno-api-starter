import { Hono } from "https://deno.land/x/hono@v3.3.0/mod.ts";
import {
  cors,
  serveStatic,
} from "https://deno.land/x/hono@v3.3.0/middleware.ts";

const app = new Hono();

// 静态服务
app.use("/static/*", serveStatic({ root: "./" }));

// 跨域
app.use(
  "/api/*",
  cors({
    origin: [], // 配置需要跨的域
  }),
);

Deno.serve(app.fetch);
