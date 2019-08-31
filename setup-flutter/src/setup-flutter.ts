import * as core from "@actions/core";

import * as installer from "./installer";

async function run(): Promise<void> {
  try {
    const channel = core.getInput("channel");

    await installer.getFlutter(channel);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
