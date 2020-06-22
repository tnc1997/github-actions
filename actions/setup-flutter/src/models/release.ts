import { Channel } from "../enums/channel";

export class Release {
  constructor(
    public hash: string,
    public channel: Channel,
    public version: string,
    public release_date: Date,
    public archive: string,
    public sha256: string
  ) {}
}
