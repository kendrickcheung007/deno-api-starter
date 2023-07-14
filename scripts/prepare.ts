import { slash } from "https://deno.land/x/easy_std@v0.4.6/src/path.ts";
import { walk } from "https://deno.land/std@0.194.0/fs/walk.ts";

interface Module {
  name: string;
  path: string;
}

async function createRoutes(dir = "./api", output = "./routes.ts") {
  let counter = 0;
  const imports: string[] = [];
  const modules: Module[] = [];
  for await (
    const entry of walk(dir, {
      includeFiles: true,
      includeDirs: false,
      exts: [".ts"],
    })
  ) {
    const module: Module = {
      name: `$${counter++}`,
      path: slash(entry.path),
    };
    modules.push(module);
    imports.push(`import ${module.name} from "./${module.path}"`);
  }
  const importsText = imports.join("\n");

  const routes = modules.map((m) => m.name);
  const routesText = `export const routes = ${JSON.stringify(routes, null, 2)}`
    .replace(/(['"])(\$.*?)\1/g, "$2");

  const text = `${importsText}\n\n${routesText}`;

  Deno.writeTextFile(output, text);
}

async function prepareRoutes() {
  const dir = "api";
  const output = "routes.ts";

  // 刚开始需要创建路由表
  createRoutes(dir, output);

  // 有新文件或删除文件时重新创建
  const watcher = Deno.watchFs(dir, {
    recursive: true,
  });

  for await (const event of watcher) {
    if (event.kind === "create" || event.kind === "remove") {
      createRoutes(dir, output);
    }
  }
}

// watch 生成路由
await prepareRoutes();
