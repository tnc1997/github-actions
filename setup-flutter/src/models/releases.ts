// tslint:disable
import { CurrentRelease } from "./current-release";
import { Release } from "./release";

export class Releases {
  constructor(
    public base_url: string,
    public current_release: CurrentRelease,
    public releases: Release[]
  ) {}
}
