import { consoleDateLog, writeDateLog } from "./utils/log.ts";
import { Hono } from "https://deno.land/x/hono@v3.3.0/mod.ts";
import {
  cors,
  logger,
  serveStatic,
} from "https://deno.land/x/hono@v3.3.0/middleware.ts";
import { inDenoDeploy } from "./utils/runtime.ts";

const app = new Hono();

// 日志
app.use(
  "*",
  logger((text) => {
    const date = new Date();
    // 输出日志到控制台
    consoleDateLog(text, date);
    // 写入日志到本地 logs 目录 (deno deploy 等 edge 不支持)
    if (!inDenoDeploy) {  
        writeDateLog(text, date);
    }
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
