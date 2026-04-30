import { mkdir } from "fs/promises";
import { createWriteStream } from "fs";
import { join } from "path";
import { pipeline } from "stream/promises";
import { Transform } from "stream";
import unzipper from "unzipper";

export const cwd = process.cwd();
export const bin = join(cwd, "bin");
export const isLinux = process.platform === "linux";

export async function downloadFile(url: string, outPath: string) {
  await mkdir(join(outPath, ".."), { recursive: true });

  const response = await fetch(url);

  if (!response.ok || !response.body) {
    throw new Error(
      `Request failed: ${response.status}\n${response.statusText}`,
    );
  }

  console.log(`Downloading archive "${url}"`);

  const total = Number(response.headers.get("content-length")) || 0;
  let downloaded = 0;

  const progressStream = new Transform({
    transform(chunk, _, callback) {
      downloaded += chunk.length;

      const percent = ((downloaded / total) * 100).toFixed(2);
      process.stdout.write(`\rDownloading... ${percent}%`);

      callback(null, chunk);
    },
  });

  const fileStream = createWriteStream(outPath);

  return await pipeline(response.body, progressStream, fileStream).then(() => {
    console.log(`\nCompleted download!`);
  });
}

export async function downloadZip(
  url: string,
  outfile: string,
  extractPath: string,
) {
  await downloadFile(url, outfile);

  const archive = await unzipper.Open.file(outfile);

  await archive.extract({ path: extractPath });
}
