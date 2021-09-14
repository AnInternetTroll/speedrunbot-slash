#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --no-check
import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { Format, MarkupType } from "./fmt.ts";
import { getAll, getGame, getUser, SRC_API } from "./utils.ts";
import { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";
import { examined } from "./examined.ts";

interface LeaderboardMod {
  username: string;
  count: number;
}

export async function examinedLeaderboard(
  games: string[],
  { id = false, outputType = "markdown" }: Opts = {},
): Promise<string> {
  const fmt = new Format(outputType);
  const output: string[] = [];
  const leaderboard: LeaderboardMod[] = [];
  const url = new URL(`${SRC_API}/runs`);
  for (const game in games) {
    const gameObj = await getGame(games[game]);
    if (!gameObj) continue;
    url.searchParams.set("game", gameObj.id);
    for (const mod in gameObj.moderators) {
      const user = await getUser(mod, true);
      if (!user) continue;
      url.searchParams.set("examiner", mod);
      const runs = await getAll(url);
      const el = leaderboard.findIndex((mod) =>
        mod.username === user.names.international
      );
      if (el !== -1) {
        leaderboard[el] = {
          count: leaderboard[el].count + runs.length,
          username: leaderboard[el].username,
        };
      } else {
        leaderboard.push({
          count: runs.length,
          username: user.names.international,
        });
      }
    }
  }
  leaderboard.sort((a, b) => b.count - a.count);
  output.push(`${fmt.bold("Examiner leaderboard")} for ${games.join(" and ")}`)
  for (const modIndex in leaderboard) {
    output.push(
      `${leaderboard[modIndex].username}: ${leaderboard[modIndex].count}`,
    );
  }
  return output.join("\n");
}

if (import.meta.main) {
  console.log(await examinedLeaderboard(Deno.args, { outputType: "markdown" }));
}
