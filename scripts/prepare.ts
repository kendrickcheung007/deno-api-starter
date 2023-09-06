import { debounce } from "https://deno.land/std@0.201.0/async/debounce.ts";
import { walk } from "https://deno.land/std@0.201.0/fs/walk.ts";
import { useCount } from "https://deno.land/x/easy_std@v0.5.0/src/fn.ts";
import { slash } from "https://deno.land/x/easy_std@v0.5.0/src/path.ts";
import { denoFmt } from "https://deno.land/x/easy_std@v0.5.0/src/process.ts";

interface Module {
  name: string;
  path: string;
}

function formatRoutes(routes: string[]) {
  return `export const routes = ${JSON.stringify(routes, null, 2)};`
    .replace(/(['"])(\$.*?)\1/g, "$2");
}

async function readFileModules(dir: string) {
  const count = useCount();
  const modules: Module[] = [];
  for await (
    const entry of walk(dir, {
      includeFiles: true,
      includeDirs: false,
      exts: [".ts"],
    })
  ) {
    const module: Module = {
      name: `$${count()}`,
      path: slash(entry.path),
    };
    modules.push(module);
  }
  return modules;
}

export async function createRoutes(dir = "./api", output = "./routes.ts") {
  const modules = await readFileModules(dir);
  const routes: string[] = [];
  const imports: string[] = [];

  for (const module of modules) {
    routes.push(module.name);
    imports.push(`import ${module.name} from "./${module.path}";`);
  }
  const routesText = formatRoutes(routes);

  const importsText = imports.join("\n");

  const text = `${importsText}\n\n${routesText}`;

  await Deno.writeTextFile(output, text);

  await denoFmt([output]);
}

const debouncedCreateRoutes = debounce(createRoutes, 500);

export async function dev(app: string) {
  const dir = "api";
  const output = "routes.ts";

  // 刚开始需要创建路由表
  await createRoutes(dir, output);

  // 加载 app
  import(app);

  // 有新文件或删除文件时重新创建路由表
  const watcher = Deno.watchFs(dir, {
    recursive: true,
  });

  for await (const event of watcher) {
    if (event.kind === "create" || event.kind === "remove") {
      debouncedCreateRoutes(dir, output);
    }
  }
}
