// Loads `tempDirectory` before it gets wiped by tool-cache.
let tempDir = process.env.RUNNER_TEMP || "";

import { addPath, debug } from "@actions/core";
import { HttpClient } from "@actions/http-client";
import {
  cacheDir,
  downloadTool,
  extractTar,
  extractZip,
  find,
} from "@actions/tool-cache";
import { arch, platform } from "os";
import { join } from "path";

import { Release } from "./models/release";
import { Releases } from "./models/releases";

if (!tempDir) {
  let baseLocation;

  if (process.platform === "win32") {
    baseLocation = process.env.USERPROFILE || "C:\\";
  } else {
    if (process.platform === "darwin") {
      baseLocation = "/Users";
    } else {
      baseLocation = "/home";
    }
  }

  tempDir = join(baseLocation, "actions", "temp");
}

const baseUrl = "https://storage.googleapis.com/flutter_infra_release/releases/";

const flutterToolName = "Flutter";

const httpClient = new HttpClient("setup-flutter");

export async function acquireFlutter(
  release: Release,
  platform: string
): Promise<string> {
  const downloadUrl = `${baseUrl}${release.archive}`;
  debug(`Downloading archive from ${downloadUrl}.`);
  const downloadPath = await downloadTool(downloadUrl);
  debug(`Downloaded archive "${downloadPath}" from ${downloadUrl}.`);

  debug(`Extracting archive "${downloadPath}".`);
  const extPath =
    platform === "windows" || platform === "macos"
      ? await extractZip(downloadPath)
      : await extractTar(downloadPath, undefined, "x");
  debug(`Extracted archive "${downloadPath}" to ${extPath}.`);

  const toolRoot = join(extPath, "flutter");
  debug(
    `Adding ${toolRoot} to cache (${flutterToolName}, ${release.version}, ${arch()}).`
  );
  return cacheDir(toolRoot, flutterToolName, release.version, arch());
}

export async function getFlutter(channel: string): Promise<Release> {
  const platform = getPlatform();
  const release = await queryLatestRelease(channel, platform);

  let toolPath = find(flutterToolName, release.version, arch());

  if (toolPath) {
    debug(
      `${flutterToolName} found in cache (${toolPath}, ${release.version}, ${arch()}).`
    );
  } else {
    toolPath = await acquireFlutter(release, platform);
  }

  toolPath = join(toolPath, "bin");

  addPath(toolPath);

  return release;
}

export function getPlatform(): string {
  switch (platform()) {
    case "win32":
      return "windows";
    case "darwin":
      return "macos";
    default:
      return "linux";
  }
}

export async function queryLatestRelease(
  channel: string,
  platform: string
): Promise<Release> {
  const releasesUrl = `${baseUrl}releases_${platform}.json`;
  const releasesResponse = await httpClient.get(releasesUrl);
  const releases = JSON.parse(await releasesResponse.readBody()) as Releases;
  if (releases == null) {
    throw new Error(
      `Unable to find any ${flutterToolName} releases for channel "${channel}".`
    );
  }

  const hash = releases.current_release[channel];
  if (hash == null) {
    throw new Error(
      `Unable to find a ${flutterToolName} release for channel "${channel}".`
    );
  }
  debug(`The latest release hash for channel "${channel}" is ${hash}.`);

  const release = releases.releases.find((release) => release.hash === hash);
  if (release == null) {
    throw new Error(
      `Unable to find a ${flutterToolName} release for hash "${hash}".`
    );
  }
  return release;
}
