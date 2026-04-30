import { Command } from "commander";
import { checkUpdate } from "./update";
import { start } from "./start";

const program = new Command("fx");

program
  .command("start")
  .description(
    "Starts the FXServer process directly (without launching txAdmin).",
  )
  .action(() => start());

program
  .command("update")
  .description(
    "Installs the the latest recommended artifact from https://artifacts.jgscripts.com/",
  )
  .action(() => checkUpdate());

program.parse();
