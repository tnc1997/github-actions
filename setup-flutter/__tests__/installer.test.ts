import * as io from "@actions/io";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as semver from "semver";

import * as installer from "../src/installer";

let baseDirectory;

switch (os.platform()) {
  case "win32":
    baseDirectory = process.env.USERPROFILE || "C:\\";
    break;
  case "darwin":
    baseDirectory = "/Users";
    break;
  default:
    baseDirectory = "/home";
    break;
}

const tempDir = path.join(baseDirectory, "actions", "temp");
const toolDir = path.join(baseDirectory, "actions", "cache");

process.env.RUNNER_TEMP = tempDir;
process.env.RUNNER_TOOL_CACHE = toolDir;

describe("installer tests", () => {
  afterAll(async () => {
    await io.rmRF(tempDir);
    await io.rmRF(toolDir);
  }, 300000);

  beforeAll(async () => {
    await io.rmRF(tempDir);
    await io.rmRF(toolDir);
  }, 300000);

  it("Downloads and caches a version of Flutter if no matching version is installed", async () => {
    const release = await installer.getFlutter("stable");

    const flutter = path.join(
      toolDir,
      "Flutter",
      semver.clean(release.version),
      installer.getPlatform()
    );

    expect(fs.existsSync(`${flutter}.complete`)).toBe(true);
    expect(fs.existsSync(path.join(flutter, "bin", "flutter.bat"))).toBe(true);
  }, 300000);

  it("Throws if no Flutter releases can be found for the channel", async () => {
    await expect(installer.getFlutter("canary")).rejects.toThrow(
      'Unable to find a Flutter release for channel "canary".'
    );
  }, 300000);
});
