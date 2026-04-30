import { join } from "path";
import { cwd, downloadZip } from "./utils";
import { mkdir, rm, rename, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const paths = {
  data: join(cwd, "server-data"),
  temp: join(cwd, "server-data", "temp"),
  config: join(cwd, "server-data", "config"),
  resources: join(cwd, "server-data", "resources"),
};

export async function setup() {
  await rm(paths.temp, { recursive: true, force: true });

  if (!existsSync(".luarc.json")) {
    await copyFile(".luarc.default.json", ".luarc.json");
  }

  if (!existsSync(join(paths.config, "secrets.cfg"))) {
    await copyFile(
      join(paths.config, "secrets.default.cfg"),
      join(paths.config, "secrets.cfg"),
    );
  }

  await mkdir(paths.temp);
  await mkdir(paths.resources).catch(() => {});

  if (!existsSync(join(paths.resources, "[cfx]"))) {
    const cfx = join(paths.temp, "cfx-server-data-master");

    await downloadZip(
      "https://github.com/citizenfx/cfx-server-data/archive/refs/heads/master.zip",
      `${cfx}.zip`,
      paths.temp,
    );

    for (const dir of ["[gameplay]", "[local]", "[test]"]) {
      await rm(join(cfx, "resources", dir), { recursive: true, force: true });
    }

    await rename(join(cfx, "resources"), join(paths.resources, "[cfx]"));
  }

  for (const repo of ["overextended/ox_lib", "overextended/oxmysql"]) {
    const [, resource = ""] = repo.split("/", 2);

    if (existsSync(join(paths.resources, resource))) continue;

    const path = join(paths.temp, `${resource}.zip`);

    await downloadZip(
      `https://github.com/${repo}/releases/latest/download/${resource}.zip`,
      path,
      paths.resources,
    );
  }

  await rm(paths.temp, { recursive: true, force: true });
}
