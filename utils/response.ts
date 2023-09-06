import {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.201.0/http/http_status.ts";
import {
  type Context,
  HTTPException,
} from "https://deno.land/x/hono@v3.6.0-rc.1/mod.ts";

// 规范成功请求
export function useFailResponse(
  c: Context,
  data = c.error?.message,
  status = c.res.status,
) {
  return c.json({
    msg: "fail",
    data: data ?? STATUS_TEXT[c.res.status as Status] ?? c.res.statusText,
  }, status);
}

// 规范失败请求
// deno-lint-ignore no-explicit-any
export function useSuccessResponse<T = any>(
  c: Context,
  data: T,
  status = Status.OK,
) {
  return c.json({
    msg: "success",
    data,
  }, status);
}

export function assert(
  expr: unknown,
  msg: string,
  error_status = Status.BadRequest,
): asserts expr {
  if (!expr) {
    throw new HTTPException(error_status, {
      message: msg,
    });
  }
}
