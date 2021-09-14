#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --no-check
import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { Format, MarkupType } from "./fmt.ts";
import { getAll, getGame, getUser, SRC_API } from "./utils.ts";
import { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";
interface ExaminedObject {
  total: number;
  fullGame: number;
  individualLevel: number;
  verified: number;
  rejected: number;
}

export async function examined(
  username: string,
  games: string[],
  { id, outputType }: { id?: boolean; outputType: MarkupType },
): Promise<string>;
export async function examined(
  username: string,
  games: string[],
  { id, outputType }: { id?: boolean; outputType: "object" },
): Promise<ExaminedObject>;
export async function examined(
  username: string,
  games: string[] = [],
  { id = false, outputType = "markdown" }: {
    id?: boolean;
    outputType?: MarkupType;
  } = {},
): Promise<string | ExaminedObject> {
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
  const url = new URL(`${SRC_API}/runs?examiner=${userId}`);

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
  let verifiedRuns = 0;
  let rejectedRuns = 0;
  runs.forEach((run) => {
    if (run.level) individualLevelRuns++;
    else fullGameRuns++;
    if (run.status.status === "verified") verifiedRuns++;
    else rejectedRuns++;
  });
  if (outputType === "object") {
    return {
      total: runs.length,
      fullGame: fullGameRuns,
      individualLevel: individualLevelRuns,
      verified: verifiedRuns,
      rejected: rejectedRuns,
    };
  }
  output.push(`${fmt.bold("Examined Count")}: ${username}`);
  output.push(`Fullgame: ${fullGameRuns}`);
  output.push(`Individual Level: ${individualLevelRuns}`);
  output.push("---")
  output.push(`Verified: ${verifiedRuns}`);
  output.push(`Rejected: ${rejectedRuns}`);
  output.push("---")
  output.push(`Total: ${fullGameRuns + individualLevelRuns}`);
  return output.join("\n");
}

if (import.meta.main) {
  const [username, ...games] = Deno.args;
  console.log(await examined(username, games, { outputType: "markdown" }));
}

Deno.test("Get user by username", async () => {
  const res = await examined("AnInternetTroll", [], {
    outputType: "plain",
  });
  const expected = `Examined Count: AnInternetTroll
Fullgame: 360
Individual Level: 184
Total: 544`;
  assertEquals(res, expected);
});
