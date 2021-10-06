#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import type { MarkupType } from "./fmt.ts";
import type { SpeedrunCom } from "./types.d.ts";
export const SRC_API = "https://www.speedrun.com/api/v1";

export interface Opts {
  id?: boolean;
  outputType?: MarkupType;
}

interface ApiArrayResponse {
  data: unknown[];
  pagination: {
    size: number;
    max: number;
    offset: number;
    links: {
      rel: "next" | "prev";
      uri: string;
    }[];
  };
}

export async function getUser(
  username: string,
  id?: boolean,
): Promise<SpeedrunCom.User | false> {
  let res: Response;
  if (id) {
    res = await fetch(`${SRC_API}/users/${encodeURI(username)}`);
    const data = (await res.json()).data as SpeedrunCom.User;
    return res.ok ? data : false;
  } else {
    res = await fetch(`${SRC_API}/users?lookup=${encodeURI(username)}`);
    const data = (await res.json()).data as SpeedrunCom.User[];
    return data[0] ? data[0] : false;
  }
}

export async function getGame(
  abbreviation: string,
): Promise<SpeedrunCom.Game | false> {
  const res = await fetch(`${SRC_API}/games?abbreviation=${abbreviation}`);
  const data = (await res.json()).data as SpeedrunCom.Game[];
  return data[0] ? data[0] : false;
}

export async function getAll(url: URL | string): Promise<unknown[]> {
  if (typeof url === "string") url = new URL(url);
  url.searchParams.set("max", "200");
  let data: unknown[] = [];
  let size = 0;
  let tmpSize;
  do {
    url.searchParams.set("offset", size.toString());
    const res = await fetch(url);
    const resJSON = await res.json() as ApiArrayResponse;
    data = data.concat(resJSON.data);
    size += resJSON.pagination.size;
    tmpSize = resJSON.pagination.size;
  } while (tmpSize === 200);
  return data;
}
