import { join } from "node:path";
import { $ } from "bun";
import { checkUpdate } from "./update";
import { bin, isLinux } from "./utils";
import { setup } from "./setup";

export async function start() {
  const exe = join(bin, isLinux ? "run.sh" : "fxserver.exe");
  await setup();
  await checkUpdate();

  process.chdir("./server-data");
  try {
    await $`${exe} +exec server.cfg`;
  } catch (e) {}
}
