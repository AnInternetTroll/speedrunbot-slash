import {
	ApplicationCommandChoice,
	ApplicationCommandInteraction,
	ApplicationCommandOption,
	ApplicationCommandsModule,
	autocomplete,
	AutocompleteInteraction,
	Embed,
	slash,
	SlashCommandOptionType,
	SlashCommandPartial,
} from "../../deps_server.ts";

import { games } from "./games.ts";
import { examined } from "./examined.ts";
import { examinedLeaderboard } from "./examined_leaderboard.ts";
import { categories } from "./categories.ts";
import { runs } from "./runs.ts";
import { whois } from "./whois.ts";
import { worldRecords } from "./world_records.ts";
import { worldRecord } from "./world_record.ts";
import { categoriesPlayed } from "./categories_played.ts";
import { pendingGames } from "./pending_games.ts";
import { pendingCount } from "./pending_count.ts";
import { podiums } from "./podiums.ts";
import { modCount } from "./mod_count.ts";
import { pendingUsers } from "./pending_users.ts";
import { SRC_API } from "./utils.ts";
import { runInfo } from "./run_info.ts";

import type { SpeedrunCom as ISpeedrunCom } from "./types.d.ts";
import gameInfo from "./game_info.ts";

const srcUser: ApplicationCommandOption = {
	name: "username",
	type: SlashCommandOptionType.STRING,
	description: "A speedrun.com username",
	autocomplete: true,
};
const srcGame: ApplicationCommandOption = {
	name: "game",
	description: "A game abbreviation.",
	type: SlashCommandOptionType.STRING,
	autocomplete: true,
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
		name: "mod-count",
		description: "See how many games and series a user moderates.",
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
		name: "categories-played",
		description: "See how many categories a player has submitted runs to.",
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
	{
		name: "podiums",
		description:
			"See how many runs a player has on the podium of leaderboards.",
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
	{
		name: "examined-leaderboard",
		description: "See how many runs all moderators of a game have examined.",
		options: [
			{
				...srcGame,
				required: true,
			},
			{
				...srcGame,
				name: "game2",
			},
		],
	},
	{
		name: "pending-games",
		description: "See all pending runs of a game.",
		options: [
			{
				...srcGame,
				required: true,
			},
			{
				...srcGame,
				name: "game2",
			},
		],
	},
	{
		name: "pending-users",
		description: "See all pending runs of a users.",
		options: [
			{
				...srcUser,
				required: true,
			},
			{
				...srcUser,
				name: "username2",
			},
		],
	},
	{
		name: "pending-count",
		description: "See how man pending runs a game has.",
		options: [
			{
				...srcGame,
				required: true,
			},
			{
				...srcGame,
				name: "game2",
			},
		],
	},
	{
		name: "runs",
		description: "See how many runs a player has submitted.",
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
	{
		name: "whois",
		description: "See info about a speedrun.com user.",
		options: [
			{
				...srcUser,
				required: true,
			},
		],
	},
	{
		name: "world-records",
		description: "See how many world records a player has submitted.",
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
	{
		name: "world-record",
		description:
			"See the world record of a given game, category, and sub category.",
		options: [
			{
				...srcGame,
				required: true,
			},
			{
				name: "category",
				description: "A game's category",
				type: SlashCommandOptionType.STRING,
			},
			{
				name: "subcategory",
				description: "A game's variable, such as a sub category",
				type: SlashCommandOptionType.STRING,
			},
		],
	},
	{
		name: "run-info",
		description: "Get info about a run ID or link",
		options: [
			{
				name: "run",
				description: "A run ID or link",
				type: SlashCommandOptionType.STRING,
				required: true,
			},
		],
	},
	{
		name: "game-info",
		description: "Get info about a run ID or link",
		options: [
			{
				...srcGame,
				required: true,
			},
		],
	},
];

function splitIntoChunks(array: string[], perChunk: number): string[][] {
	const result = array.reduce<string[][]>((resultArray, item, index) => {
		const chunkIndex = Math.floor(index / perChunk);

		if (!resultArray[chunkIndex]) {
			resultArray[chunkIndex] = []; // start a new chunk
		}

		resultArray[chunkIndex].push(item);

		return resultArray;
	}, []);

	return result;
}

async function sendCommand(
	i: ApplicationCommandInteraction,
	func: (i: ApplicationCommandInteraction) => Promise<string>,
	{ defer = true }: { defer?: boolean } = {},
) {
	if (defer) await i.defer();
	const [title, ...description] = (await func(i)).split("\n");
	if (description.length > 10) {
		await i.reply(
			"This message will be sent into many small and hidden chunks to prevent spam.",
		);
		const chunks = splitIntoChunks(description, 10);
		for (let ii = 0; ii < chunks.length; ii++) {
			await i.send({
				embed: new Embed({
					title: `${title}: ${ii + 1}/${chunks.length}`,
					description: chunks[ii].join("\n"),
				}),
				ephemeral: true,
			});
		}
	} else {
		const embed = new Embed({
			title,
			description: description.join("\n"),
		});
		await i.reply({ embeds: [embed] });
	}
}

export class SpeedrunCom extends ApplicationCommandsModule {
	@autocomplete("*", "*")
	async autoComplete(d: AutocompleteInteraction) {
		const completions: ApplicationCommandChoice[] = [];
		if (
			d.focusedOption.name.includes("user") ||
			d.focusedOption.name.includes("username")
		) {
			const res = await fetch(`${SRC_API}/users?name=${d.focusedOption.value}`);
			const body = await res.json();
			completions.push(...(body.data as ISpeedrunCom.User[]).map((user) => ({
				name: user.names.international,
				value: user.names.international,
			})));
		} else if (d.focusedOption.name.includes("game")) {
			const res = await fetch(`${SRC_API}/games?name=${d.focusedOption.value}`);
			const body = await res.json();
			completions.push(...(body.data as ISpeedrunCom.Game[]).map((game) => ({
				name: game.names.international,
				value: game.abbreviation,
			})));
		}
		return d.autocomplete(
			completions,
		);
	}

	@slash()
	async games(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) => games(i.option("username"), { outputType: "markdown" }),
		);
	}

	@slash()
	async modCount(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) => modCount(i.option("username"), { outputType: "markdown" }),
		);
	}

	@slash()
	async categories(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) => categories(i.option("game"), { outputType: "markdown" }),
		);
	}

	@slash("categories-played")
	async categoriesPlayed(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) =>
				categoriesPlayed(i.option("username"), [
					i.option("game"),
					i.option("game2"),
				], { outputType: "markdown" }),
		);
	}

	@slash()
	async podiums(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) =>
				podiums(i.option("username"), [
					i.option("game"),
					i.option("game2"),
				], { outputType: "markdown" }),
		);
	}

	@slash()
	async examined(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) =>
				examined(i.option("username"), [
					i.option("game"),
					i.option("game2"),
				], { outputType: "markdown" }),
		);
	}

	@slash("examined-leaderboard")
	async examinedLeaderboard(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) =>
				examinedLeaderboard([
					i.option("game"),
					i.option("game2"),
				], { outputType: "markdown" }),
		);
	}

	@slash()
	async runs(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) =>
				runs(i.option("username"), [
					i.option("game"),
					i.option("game2"),
				], { outputType: "markdown" }),
		);
	}

	@slash("pending-games")
	async pendingGames(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) =>
				pendingGames([
					i.option("game"),
					i.option("game2"),
				], { outputType: "markdown" }),
		);
	}

	@slash("pending-users")
	async pendingUsers(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) =>
				pendingUsers([
					i.option("username"),
					i.option("username2"),
				], { outputType: "markdown" }),
		);
	}

	@slash("pending-count")
	async pendingCount(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) =>
				pendingCount([
					i.option("game"),
					i.option("game2"),
				], { outputType: "markdown" }),
		);
	}

	@slash()
	async whois(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) => whois(i.option("username"), { outputType: "markdown" }),
		);
	}

	@slash("world-records")
	async worldRecords(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) =>
				worldRecords(i.option("username"), [
					i.option("game"),
					i.option("game2"),
				], { outputType: "markdown" }),
		);
	}

	@slash("world-record")
	async worldRecord(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) =>
				worldRecord(
					i.option("game"),
					i.option("category"),
					i.option("subcategory"),
					{ outputType: "markdown" },
				),
		);
	}

	@slash("run-info")
	async runInfo(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) =>
				runInfo(
					i.option("run"),
					{ outputType: "markdown" },
				),
		);
	}

	@slash("game-info")
	async gameInfo(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) =>
				gameInfo(
					i.option("game"),
					{ outputType: "markdown" },
				),
		);
	}
}
