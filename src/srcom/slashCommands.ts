import {
  SlashCommandOptionType,
  SlashCommandPartial,
} from "https://deno.land/x/harmony@v2.1.3/deploy.ts";
const srcUser = {
  name: "username",
  type: SlashCommandOptionType.STRING,
  description: "A speedrun.com username",
};
const srcGame = {
  name: "game",
  description: "A game abbreviation.",
  type: SlashCommandOptionType.STRING,
};
export const commands: SlashCommandPartial[] = [
  {
    name: "games",
    description: "See how many games a player has submitted runs to.",
    options: [
      {
        ...srcUser,
        required: true,
      },
    ],
  },
  {
    name: "categories",
    description: "See the categories of a game.",
    options: [
      {
        ...srcGame,
        required: true,
      },
    ],
  },
  {
    name: "examined",
    description: "See how many runs a user has examined.",
    options: [
      {
        ...srcUser,
        required: true,
      },
      srcGame,
      {
        ...srcGame,
        name: "game2",
      },
    ],
  },
];
