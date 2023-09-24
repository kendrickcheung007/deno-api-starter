import { Status } from "https://deno.land/std@0.202.0/http/http_status.ts";
import {
  cors,
  prettyJSON,
  serveStatic,
} from "https://deno.land/x/hono@v3.7.2/middleware.ts";
import { Hono } from "https://deno.land/x/hono@v3.7.2/mod.ts";

import { routes } from "./routes.ts";
import { logger } from "./middlewares/logger.ts";
import { useFailResponse } from "./utils/response.ts";

type AppContext = {
  Bindings: {
    ip: string;
  };
};

export const app = new Hono<AppContext>();

export type App = typeof app;

// 404 处理
app.notFound((c) => {
  return useFailResponse(c, c.error?.message, Status.NotFound);
});

// 错误处理
app.onError((err, c) => {
  const failStatus =
    c.res.status === Status.NotFound
      ? Status.InternalServerError
      : c.res.status;
  return useFailResponse(c, err.message, failStatus);
});

// 日志
app.use("*", logger());

// 跨域
app.use(
  "*",
  cors({
    origin: [], // 配置需要跨的域
  })
);

// 美化 json
app.use("*", prettyJSON());

// 静态服务
app.use("/static/*", serveStatic({ root: "./" }));

routes.forEach((route) => {
  route(app);
});

function getIp(da: Deno.Addr) {
  if (["tcp", "udp"].includes(da.transport)) {
    const a = da as Deno.NetAddr;
    return `${a.hostname}:${a.port}`;
  } else {
    const a = da as Deno.UnixAddr;
    return a.path;
  }
}

Deno.serve((request, ci) => {
  return app.fetch(request, {
    ip: getIp(ci.remoteAddr),
  });
});
