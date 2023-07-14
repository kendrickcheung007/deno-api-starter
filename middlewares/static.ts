import type { Context, Next } from "https://deno.land/x/hono@v3.3.0/mod.ts";
import { getMimeType } from "https://deno.land/x/hono@v3.3.0/utils/mime.ts";
import { getFilePath } from "https://deno.land/x/hono@v3.3.0/utils/filepath.ts";

export type ServeStaticOptions = {
  root?: string;
  path?: string;
  rewriteRequestPath?: (path: string) => string;
};

const { open } = Deno

const DEFAULT_DOCUMENT = "index.html";

// 静态服务 (流式处理)
export const serveStatic = (options: ServeStaticOptions = { root: "" }) => {
  return async (c: Context, next: Next) => {
    // Do nothing if Response is already set
    if (c.finalized) {
      await next();
      return;
    }

    const url = new URL(c.req.url);
    const filename = options.path ?? decodeURI(url.pathname);
    let path = getFilePath({
      filename: options.rewriteRequestPath
        ? options.rewriteRequestPath(filename)
        : filename,
      root: options.root,
      defaultDocument: DEFAULT_DOCUMENT,
    });

    path = `./${path}`;


    let file

    try {
      file = await open(path)
    } catch (e) {
      console.warn(`${e}`)
    }

    if (file) {
      const mimeType = getMimeType(path);
      if (mimeType) {
        c.header("Content-Type", mimeType);
      }
      // 对文件进行流式处理
      return c.body(file.readable);
    } else {
      console.warn(`Static file: ${path} is not found`);
      await next();
    }
    return;
  };
};
