import { rmRF } from "@actions/io";
import { join } from "path";
import { existsSync } from "fs";
import { getFlutter, getPlatform } from "../src/installer";

const tempDir = join(
  __dirname,
  "runner",
  join(Math.random().toString(36).substring(7)),
  "temp"
);
const toolDir = join(
  __dirname,
  "runner",
  join(Math.random().toString(36).substring(7)),
  "tools"
);

process.env.RUNNER_TEMP = tempDir;
process.env.RUNNER_TOOL_CACHE = toolDir;

describe("installer tests", () => {
  afterAll(async () => {
    await rmRF(tempDir);
    await rmRF(toolDir);
  }, 300000);

  beforeAll(async () => {
    await rmRF(tempDir);
    await rmRF(toolDir);
  }, 300000);

  it("Downloads and caches a version of Flutter if no matching version is installed", async () => {
    const release = await getFlutter("stable");

    const flutter = join(toolDir, "Flutter", release.version, getPlatform());

    expect(existsSync(`${flutter}.complete`)).toBe(true);
    expect(existsSync(join(flutter, "bin", "flutter.bat"))).toBe(true);
  }, 300000);

  it("Throws if no Flutter releases can be found for the channel", async () => {
    await expect(getFlutter("canary")).rejects.toThrow(
      'Unable to find a Flutter release for channel "canary".'
    );
  }, 300000);
});
