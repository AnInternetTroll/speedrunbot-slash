#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { Format } from "./fmt.ts";
import { getAll, getGame, getUser, SRC_API } from "./utils.ts";
import { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

export async function runs(
  username: string,
  games: string[] = [],
  { id = false, outputType = "markdown" }: Opts = {},
): Promise<string> {
  const fmt = new Format(outputType);
  const output: string[] = [];
  let userId: string;
  if (!id) {
    const userIdTmep = await getUser(username);
    if (!userIdTmep) return `No user with the username "${username}"`;
    else {
      userId = userIdTmep.id;
      username = userIdTmep.names.international;
    }
  } else userId = username;
  const url = new URL(`${SRC_API}/runs?user=${userId}`);

  const runs: SpeedrunCom.Run[] = [];
  if (games.length) {
    for (const game in games) {
      const gameId = await getGame(games[game]);
      if (gameId) {
        url.searchParams.set("game", gameId.id);
        runs.push.apply(runs, await getAll(url) as SpeedrunCom.Run[]);
      }
    }
  } else {
    runs.push.apply(runs, await getAll(url) as SpeedrunCom.Run[]);
  }
  let fullGameRuns = 0;
  let individualLevelRuns = 0;
  runs.forEach((run) => {
    if (run.level) individualLevelRuns++;
    else fullGameRuns++;
  });
  output.push(`${fmt.bold("Run Count")}: ${username}`);
  output.push(`Fullgame: ${fullGameRuns}`);
  output.push(`Individual Level: ${individualLevelRuns}`);
  output.push(`Total: ${fullGameRuns + individualLevelRuns}`);
  return output.join("\n");
}

if (import.meta.main) {
  const [username, ...games] = Deno.args;
  console.log(await runs(username, games, { outputType: "terminal" }));
}
Deno.test("Get user by username", async () => {
  const res = await runs("AnInternetTroll", undefined, { outputType: "plain" });
  const expected = `Run Count: AnInternetTroll
Fullgame: 20
Individual Level: 48
Total: 68`;
  assertEquals(res, expected);
});
