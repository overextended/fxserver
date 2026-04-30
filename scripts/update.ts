import { join } from "node:path";
import { file, $, Archive } from "bun";
import { bin, downloadFile, isLinux } from "./utils";
import { path7za } from "7zip-bin";
import { extractFull } from "node-7z";

interface ArtifactsApi {
  recommendedArtifact: string;
  windowsDownloadLink: string;
  linuxDownloadLink: string;
  brokenArtifacts: { artifact: string; reason: string }[];
}

const infoFile = file(join(bin, ".info"));

export async function checkUpdate() {
  const info: { artifact: string; last_updated: number } & ArtifactsApi =
    (await infoFile.json().catch(() => {})) || {
      artifact: "0",
      last_updated: 0,
    };

  const timestamp = Math.floor(Date.now() / 1000);

  if (timestamp - info.last_updated < 300) return;

  const response = (await fetch(`https://artifacts.jgscripts.com/jsonv2`).then(
    (v) => v?.json().catch(() => ({})),
  )) as ArtifactsApi;

  await infoFile.write(
    JSON.stringify({
      ...info,
      last_updated: timestamp,
    }),
  );

  if (info.artifact === response.recommendedArtifact) return;

  const issues = [];

  for (const broken of response.brokenArtifacts) {
    if (info.artifact === broken.artifact) {
      issues.push(broken.reason);
    } else {
      const [min, max] = broken.artifact.split("-");

      if (!min || !max) continue;

      if (+info.artifact >= +min && +info.artifact <= +max)
        issues.push(broken.reason);
    }
  }

  if (issues.length) {
    console.warn(
      `fxserver version ${info.artifact} may be unsafe for use in production!\n\ - ${issues.join("\n\ - ")}`,
    );

    console.info(
      `Update fxserver to version ${response.recommendedArtifact} for the best experience.`,
    );
  }

  await update(
    response.recommendedArtifact,
    response[isLinux ? "linuxDownloadLink" : "windowsDownloadLink"],
  );
}

export async function update(version: string, url: string) {
  let fileName = isLinux ? "fx.tar.xz" : "server.7z";
  let output = join(bin, fileName);

  await downloadFile(url, output);

  console.log(`Extracting files...`);

  try {
    if (isLinux) {
      await $`xz -df ${output}`;

      fileName = fileName.slice(0, -3);
      output = join(bin, fileName);

      const bunfile = file(output);
      const input = await bunfile.bytes();
      const archive = new Archive(input);

      await $`rm -rf ${bin}`;
      await archive.extract(bin);
    } else {
      extractFull(output, bin, {
        $bin: path7za,
      });
    }

    await infoFile.write(
      JSON.stringify({
        artifact: version,
        last_updated: Math.floor(Date.now() / 1000),
      }),
    );

    console.log(`Successfully updated fxserver to version ${version}!`);
    process.exitCode = 0;
  } catch (e) {
    console.error(e);
  }
}
