import { logger as _logger } from "https://deno.land/x/hono@v3.7.2/middleware.ts";
import type { MiddlewareHandler } from "https://deno.land/x/hono@v3.7.2/types.ts";
import { inDenoDeploy } from "../utils/runtime.ts";

import { format } from "https://deno.land/std@0.202.0/datetime/format.ts";
import { ensureFile } from "https://deno.land/std@0.202.0/fs/ensure_file.ts";
import { join } from "https://deno.land/std@0.202.0/path/mod.ts";

const COLOR_STATUS_REG = /.\[3\wm(\w{3}).\[0m/;

// 写文件 logger
export async function writeDateLog(
  text: string,
  date = new Date(),
  dir = "./logs"
) {
  const filepath = join(dir, format(date, "yyyy/MM-dd"));
  await ensureFile(filepath);
  const withoutColorText = text.replace(COLOR_STATUS_REG, "$1");
  const record = `${format(date, "HH:mm:ss.SSS")} - ${withoutColorText}\n`;
  await Deno.writeTextFile(filepath, record, {
    append: true,
  });
}

// 输出控制台 logger
export function consoleDateLog(text: string, date: Date = new Date()) {
  console.log(format(date, "yyyy-MM-dd HH:mm:ss.SSS"), text);
}

export function logger(): MiddlewareHandler {
  if (inDenoDeploy) {
    return _logger((text) => consoleDateLog(text));
  }
  return _logger((text) => {
    const date = new Date();
    // 输出到控制台
    consoleDateLog(text, date);
    // 写入日志到本地 logs 目录 (deno deploy 等 edge 不支持)
    writeDateLog(text, date);
  });
}
