#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { Format, MarkupType } from "./fmt.ts";
import { getAll, getGame, getUser, SRC_API } from "./utils.ts";
import { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

interface CategoriesObject {
  fullGame: string[];
  misc: string[];
}

export async function categories(
  username: string,
  { id, outputType }: { id?: boolean; outputType: "object" },
): Promise<CategoriesObject>;
export async function categories(
  username: string,
  { id, outputType }: { id?: boolean; outputType?: MarkupType },
): Promise<string>;
export async function categories(
  game: string,
  { id = false, outputType = "markdown" }: Opts = {},
): Promise<string | CategoriesObject> {
  const fmt = new Format(outputType);
  const output: string[] = [];
  let gameId: string | false;

  if (!id) {
    const gameIdTmp = await getGame(game);
    gameId = gameIdTmp ? gameIdTmp.id : false;
  } else gameId = game;

  if (!game) output.push(`No game with the abbreviation ${game} found`);

  const res = await fetch(`${SRC_API}/games/${gameId}/categories`);
  const categories = (await res.json()).data as SpeedrunCom.Category[];
  const fullGameCategories: string[] = [];
  const miscCategories: string[] = [];
  categories.forEach(category => {
    if (category.miscellaneous) miscCategories.push(category.name);
    else fullGameCategories.push(category.name);
  });
  output.push(`${fmt.bold(`Categories - ${game}`)}`);
  output.push(`Fullgame: ${fullGameCategories.join(", ")}`);
  output.push(`Miscellaneous: ${miscCategories.join(", ")}`);
  return output.join("\n");
}

if (import.meta.main) {
  console.log(await categories(Deno.args[0], { outputType: "terminal" }));
}
