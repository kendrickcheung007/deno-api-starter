import { walk } from "https://deno.land/std@0.199.0/fs/walk.ts";
import { slash } from "https://deno.land/x/easy_std@v0.4.8/src/path.ts";
import { debounce } from "https://deno.land/std@0.199.0/async/debounce.ts";

interface Module {
  name: string;
  path: string;
}

function useCount(count = 0) {
  return function (newCount?: number) {
    if (newCount !== undefined) {
      count = newCount;
      return count;
    }
    return count++;
  };
}

function formatRoutes(routes: string[]) {
  const count = useCount();
  const { length } = routes;
  return `export const routes = ${JSON.stringify(routes, replacer, 2)};`
    .replace(/(['"])(\$.*?)\1/g, "$2");
  function replacer(_: string, v: unknown) {
    if (count() === length) {
      return v + ",";
    }
    return v;
  }
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

  Deno.writeTextFile(output, text);
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
