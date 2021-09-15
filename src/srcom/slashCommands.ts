import {
	ApplicationCommandInteraction,
	ApplicationCommandOption,
	ApplicationCommandsModule,
	Embed,
	slash,
	SlashCommandOptionType,
	SlashCommandPartial,
} from "https://deno.land/x/harmony@v2.1.3/deploy.ts";

import { games } from "./games.ts";
import { examined } from "./examined.ts";
import { examinedLeaderboard } from "./examinedLeaderboard.ts";
import { categories } from "./categories.ts";
import { runs } from "./runs.ts";
import { whois } from "./whois.ts";
import { worldRecords } from "./worldrecords.ts";

const srcUser: ApplicationCommandOption = {
	name: "username",
	type: SlashCommandOptionType.STRING,
	description: "A speedrun.com username",
};
const srcGame: ApplicationCommandOption = {
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
];

async function sendCommand(
	i: ApplicationCommandInteraction,
	func: (i: ApplicationCommandInteraction) => Promise<string>,
	{ defer = false }: { defer?: boolean } = {},
) {
	if (defer) i.defer();
	const [title, ...description] = (await func(i)).split("\n");
	const embed = new Embed({
		title,
		description: description.join("\n"),
	});
	await i.reply({ embeds: [embed] });
}

export class SpeedrunCom extends ApplicationCommandsModule {
	@slash()
	async games(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) => games(i.option("username"), { outputType: "markdown" }),
		);
	}

	@slash()
	async categories(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) => categories(i.option("game"), { outputType: "markdown" }),
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
			{ defer: true },
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
}
