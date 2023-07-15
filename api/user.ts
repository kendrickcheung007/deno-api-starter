import { Hono } from "https://deno.land/x/hono@v3.3.0/mod.ts";
import { useSuccessResponse } from "../utils/response.ts";

// TODO
export default function (app: Hono) {
  app.get("/api/users", (c) => useSuccessResponse(c, "获取所有用户"));
  app.get("/api/user/:id", (c) => useSuccessResponse(c, "获取特定用户信息"));
  app.put("/api/user/:id", (c) => useSuccessResponse(c, "更新特定用户信息"));
  app.delete("/api/user/:id", (c) => useSuccessResponse(c, "删除用户"));
  app.post("/api/user/login", (c) => useSuccessResponse(c, "用户登录"));
  app.post("/api/user", (c) => useSuccessResponse(c, "创建用户"));
  app.post("/api/user/register", (c) => useSuccessResponse(c, "用户注册"));
}
