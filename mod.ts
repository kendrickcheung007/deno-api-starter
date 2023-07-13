import { consoleDateLog, writeDateLog } from "./utils/log.ts";
import { Hono } from "https://deno.land/x/hono@v3.3.0/mod.ts";
import {
  cors,
  logger,
  serveStatic,
} from "https://deno.land/x/hono@v3.3.0/middleware.ts";

const app = new Hono();

// 日志
app.use(
  "*",
  logger((text) => {
    const date = new Date();
    consoleDateLog(text, date)
    writeDateLog(text, date)
  }),
);

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
