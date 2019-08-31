// Loads `tempDirectory` before it gets wiped by tool-cache.
let tempDir = process.env.RUNNER_TEMP || "";

import * as core from "@actions/core";
import * as toolCache from "@actions/tool-cache";
import * as os from "os";
import * as path from "path";
import * as typedRestClient from "typed-rest-client";

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

  tempDir = path.join(baseLocation, "actions", "temp");
}

const baseUrl = "https://storage.googleapis.com/flutter_infra/releases/";

const flutterToolName = "Flutter";

const restClient = new typedRestClient.RestClient("setup-flutter");

export async function acquireFlutter(
  release: Release,
  platform: string
): Promise<string> {
  const downloadUrl = `${baseUrl}${release.archive}`;
  core.debug(`Downloading archive from ${downloadUrl}.`);
  const downloadPath = await toolCache.downloadTool(downloadUrl);
  core.debug(`Downloaded archive "${downloadPath}" from ${downloadUrl}.`);

  core.debug(`Extracting archive "${downloadPath}".`);
  const extPath =
    platform === "windows" || platform === "macos"
      ? await toolCache.extractZip(downloadPath)
      : await toolCache.extractTar(downloadPath, undefined, "x");
  core.debug(`Extracted archive "${downloadPath}" to ${extPath}.`);

  const toolRoot = path.join(extPath, "flutter");
  core.debug(
    `Adding ${toolRoot} to cache (${flutterToolName}, ${release.version}, ${platform}).`
  );
  return toolCache.cacheDir(
    toolRoot,
    flutterToolName,
    release.version,
    platform
  );
}

export async function getFlutter(channel: string): Promise<Release> {
  const platform = getPlatform();
  const release = await queryLatestRelease(channel, platform);

  let toolPath = toolCache.find(flutterToolName, release.version, platform);

  if (toolPath) {
    core.debug(
      `${flutterToolName} found in cache (${toolPath}, ${release.version}, ${platform}).`
    );
  } else {
    toolPath = await acquireFlutter(release, platform);
  }

  toolPath = path.join(toolPath, "bin");

  core.addPath(toolPath);

  return release;
}

export function getPlatform(): string {
  switch (os.platform()) {
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
  const releasesResponse = await restClient.get<Releases>(releasesUrl);
  const releases = releasesResponse.result;
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
  core.debug(`The latest release hash for channel "${channel}" is ${hash}.`);

  const release = releases.releases.find(value => value.hash === hash);
  if (release == null) {
    throw new Error(
      `Unable to find a ${flutterToolName} release for hash "${hash}".`
    );
  }
  return release;
}
