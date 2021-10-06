#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format, MarkupType } from "./fmt.ts";
import { getUser, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

interface CategoriesObject {
  categoriesPlayed: number;
}

export async function categoriesPlayed(
  username: string,
  games: string[],
  { id, outputType }: { id?: boolean; outputType: "object" },
): Promise<CategoriesObject>;
export async function categoriesPlayed(
  username: string,
  games: string[],
  { id, outputType }: { id?: boolean; outputType?: MarkupType },
): Promise<string>;
export async function categoriesPlayed(
  username: string,
  games: string[] = [],
  { id = false, outputType = "markdown" }: Opts = {},
): Promise<string | CategoriesObject> {
  games = games.filter((a) => !!a);
  const fmt = new Format(outputType);
  const output: string[] = [];
  const categories: string[] = [];
  let userId: string;
  if (!id) {
    const userIdTmep = await getUser(username);
    if (!userIdTmep) return `No user with the username "${username}"`;
    else {
      userId = userIdTmep.id;
      username = userIdTmep.names.international;
    }
  } else userId = username;

  const res = await fetch(
    `${SRC_API}/users/${userId}/personal-bests?embed=game`,
  );
  const runs = (await res.json()).data as {
    place: number;
    run: SpeedrunCom.Run;
    game: { data: SpeedrunCom.Game };
  }[];
  runs.forEach((run) => {
    if (categories.includes(run.run.category)) return;
    else {
      if (games.length) {
        if (games.includes(run.game.data.abbreviation)) {
          categories.push(run.run.category);
        } else return;
      } else categories.push(run.run.category);
    }
  });

  if (outputType === "object") return { categoriesPlayed: categories.length };

  output.push(`${fmt.bold("Categories Played")}: ${username}`);
  output.push(`${categories.length}`);
  return output.join("\n");
}

if (import.meta.main) {
  const [username, ...games] = Deno.args;
  console.log(
    await categoriesPlayed(username, games, { outputType: "terminal" }),
  );
}
