/** @jsx BotUI.createElement */
/** @jsxFrag fragment */
import {
	ActionRow,
	ApplicationCommandChoice,
	ApplicationCommandInteraction,
	ApplicationCommandOption,
	ApplicationCommandsModule,
	autocomplete,
	AutocompleteInteraction,
	BotUI,
	Button,
	Embed,
	fragment,
	MessageComponentInteraction,
	slash,
	SlashCommandOptionType,
	SlashCommandPartial,
} from "../../deps_server.ts";

import { games } from "./games.ts";
import { posts } from "./posts.ts";
import { examinedLeaderboard } from "./examined_leaderboard.ts";
import { categories } from "./categories.ts";
import { runs } from "./runs.ts";
import { whois } from "./whois.ts";
import { worldRecords } from "./world_records.ts";
import { worldRecord } from "./world_record.ts";
import { categoriesPlayed } from "./categories_played.ts";
import { podiums } from "./podiums.ts";
import { modCount } from "./mod_count.ts";
import { runsCount } from "./runs_count.ts";
import {
	CommandError,
	getGame,
	searchGames,
	searchUsers,
	SRC_API,
} from "./utils.ts";
import { runInfo } from "./run_info.ts";
import { levelInfo } from "./level_info.ts";
import { categoryInfo } from "./category_info.ts";
import { leaderboard } from "./leaderboard.ts";

import type { SpeedrunCom as ISpeedrunCom } from "./types.d.ts";
import gameInfo from "./game_info.ts";
import { delay, Moogle } from "../../deps_general.ts";

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
const srcStatus: ApplicationCommandOption = {
	name: "status",
	description: "The status of a run.",
	type: SlashCommandOptionType.STRING,
	choices: [
		{
			name: "Verified",
			value: "verified",
		},
		{
			name: "Rejected",
			value: "rejected",
		},
		{
			name: "Pending",
			value: "new",
		},
	],
};
const srcExaminer: ApplicationCommandOption = {
	name: "examiner",
	description: "The examiner/reviewer of a run.",
	type: SlashCommandOptionType.STRING,
	autocomplete: true,
};
const srcEmulated: ApplicationCommandOption = {
	name: "emulated",
	description: "If a run is emulated",
	type: SlashCommandOptionType.BOOLEAN,
};
const srcLevel: ApplicationCommandOption = {
	name: "level",
	description: "A level's name.",
	type: SlashCommandOptionType.STRING,
	autocomplete: true,
};
const srcCategory = {
	name: "category",
	description: "A game's category",
	type: SlashCommandOptionType.STRING,
	autocomplete: true,
};
const srcSubcategory = {
	name: "subcategory",
	description: "A game's variable, such as a sub category",
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
		name: "posts",
		description: "See how many posts a player has posted on the site.",
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
		description: "See all runs given the parameters.",
		options: [
			srcUser,
			srcGame,
			srcStatus,
			srcExaminer,
			srcEmulated,
		],
	},
	{
		name: "runs-count",
		description: "See how many runs given the parameters.",
		options: [
			srcUser,
			srcGame,
			srcStatus,
			srcExaminer,
			srcEmulated,
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
		description: "See how many world records a player has on `speedrun.com`.",
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
			"See the world record of a given game, category, and sub-category.",
		options: [
			{
				...srcGame,
				required: true,
			},
			srcCategory,
			srcSubcategory,
		],
	},
	{
		name: "run-info",
		description: "Get info about a run.",
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
		description: "Get info about a game.",
		options: [
			{
				...srcGame,
				required: true,
			},
		],
	},
	{
		name: "level-info",
		description: "Get info about a game's level.",
		options: [
			{
				...srcGame,
				required: true,
			},
			{
				...srcLevel,
				required: true,
			},
		],
	},
	{
		name: "category-info",
		description: "Get info about a game's category.",
		options: [
			{
				...srcGame,
				required: true,
			},
			{
				...srcCategory,
				required: true,
			},
		],
	},
	{
		name: "leaderboard",
		description: "Get the top 10 for a given game, category and subcategory",
		options: [
			{
				...srcGame,
				required: true,
			},
			srcCategory,
			srcSubcategory,
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
	func: (
		i: ApplicationCommandInteraction,
		signal: AbortSignal,
	) => Promise<string>,
	{ defer = true }: { defer?: boolean } = {},
) {
	const controller = new AbortController();
	const cancelButtonId = crypto.randomUUID();
	runningTasks.set(cancelButtonId, controller);
	const CancelButton = (
		<>
			<ActionRow>
				<Button style="danger" label="Cancel" id={cancelButtonId} />
			</ActionRow>
		</>
	);

	await i.reply("Loading, please wait...", {
		components: CancelButton,
	}).catch(console.error);

	controller.signal.addEventListener("abort", () => {
		i.deleteResponse();
	});

	try {
		const [title, ...description] = (await func(i, controller.signal)).split(
			"\n",
		);
		controller.signal.throwIfAborted();

		if (description.length > 10) {
			await i.editResponse(
				"This message will be sent into many small and hidden chunks to prevent spam.",
			);
			const chunks = splitIntoChunks(description, 10);
			for (let ii = 0; ii < chunks.length; ii++) {
				controller.signal.throwIfAborted();
				await i.send({
					embeds: [
						new Embed({
							title: `${title}: ${ii + 1}/${chunks.length}`,
							description: chunks[ii].join("\n"),
						}),
					],
					components: CancelButton,
					ephemeral: true,
				});
			}
		} else {
			controller.signal.throwIfAborted();
			const embed = new Embed({
				title,
				description: description.join("\n"),
			});
			await i.editResponse({ embeds: [embed], components: [] }).catch(
				console.error,
			);
		}
	} catch (err: unknown) {
		const command = `/${i.data.name} ${
			i.data.options.map((opt) => `${opt.name}:${opt.value}`)
		}`;
		if (err instanceof DOMException && err.name === "AbortError") {
			await i.deleteResponse();
		} else if (err instanceof CommandError) {
			console.debug(err);
			await i.editResponse(`Error: ${err.message}`);
		} else if (err instanceof Error) {
			console.error(err);
			await i.send({
				embeds: [
					new Embed({
						description:
							`Unexpected Error, please report this to a developer: ${command}\n\`/${i.data.name} ${
								i.data.options.map((opt) => `${opt.name}:${opt.value}`)
							}`,
						color: 16711680,
					}),
					new Embed({
						title: err.message,
						description: `\`\`\`ts\n${err.stack}\n\`\`\``,
						color: 16711680,
					}),
				],
				ephemeral: true,
			});
		} else {
			console.error(err);
			await i.reply(
				`Critical error, please report this to a developer: \`${command}\``,
			);
		}
	}
	runningTasks.delete(cancelButtonId);
}

const runningTasks = new Map<string, AbortController>();

export class SpeedrunCom extends ApplicationCommandsModule {
	static async handleCancelButton(i: MessageComponentInteraction) {
		const task = runningTasks.get(i.customID)!;
		if (!task) {
			try {
				await i.respond({
					content: "Sorry, but I couldn't find the running task to cancel.",
					ephemeral: true,
				});
			} catch {
				await i.editResponse({
					content: "Sorry, but I couldn't find the running task to cancel.",
					ephemeral: true,
				});
			}
		}
		task.abort();
		try {
			await i.respond({
				content: "Canceled",
				ephemeral: true,
			});
		} catch {
			await i.editResponse({
				content: "Canceled",
				ephemeral: true,
			});
		}
		runningTasks.delete(i.customID);
	}

	static async #userCompletions(
		d: AutocompleteInteraction,
	): Promise<ApplicationCommandChoice[]> {
		const users = await searchUsers(d.focusedOption.value);

		return users.map((user) => ({
			name: user.name,
			value: user.name,
		}));
	}

	static async #gamesCompletions(
		d: AutocompleteInteraction,
	): Promise<ApplicationCommandChoice[]> {
		const games = await searchGames(d.focusedOption.value);
		return games.map((game) => ({ name: game.name, value: game.abbreviation }));
	}

	static async #levelCompletions(
		d: AutocompleteInteraction,
	): Promise<ApplicationCommandChoice[]> {
		const game = d.option("game");
		const level = d.option("level");
		if (
			(typeof game === "string" && game.length) && (typeof level === "string")
		) {
			const gameObj = await getGame(d.option("game"));
			if (gameObj) {
				const levels = (await (await fetch(
					`${SRC_API}/games/${gameObj.id}/levels`,
				)).json()).data as ISpeedrunCom.Level[];
				if (!levels.length) return [];
				const searchService = new Moogle<ISpeedrunCom.Level>();
				levels.forEach((level) =>
					searchService.addItem([level.name.toLowerCase()], level)
				);

				const searchResult = searchService.search(
					level.toLowerCase(),
				);
				return ([...searchResult].map((res) => ({
					name: res[1].item.name,
					value: res[1].item.name,
				})));
			}
		}
		return [];
	}

	static async #categoryCompletion(
		d: ApplicationCommandInteraction,
	): Promise<ApplicationCommandChoice[]> {
		const game = d.option("game");
		const category = d.option("category");
		if (
			(typeof game === "string" && game.length) &&
			(typeof category === "string")
		) {
			const gameObj = await getGame(d.option("game"));
			if (gameObj) {
				const categories =
					(await (await fetch(`${SRC_API}/games/${gameObj.id}/categories`))
						.json()).data as ISpeedrunCom.Category[];

				const searchService = new Moogle<ISpeedrunCom.Category>();
				categories.forEach((category) =>
					searchService.addItem([category.name.toLowerCase()], category)
				);

				const searchResult = searchService.search(
					category.toLowerCase(),
				);
				return ([...searchResult].map((res) => ({
					name: res[1].item.name,
					value: res[1].item.name,
				})));
			}
		}
		return [];
	}

	@autocomplete("*", "*")
	async autoComplete(d: AutocompleteInteraction) {
		const completions: ApplicationCommandChoice[] = [];
		if (
			d.focusedOption.name.includes("user") ||
			d.focusedOption.name.includes("username") ||
			d.focusedOption.name.includes("examiner")
		) {
			completions.push(...await SpeedrunCom.#userCompletions(d));
		} else if (d.focusedOption.name.includes("game")) {
			completions.push(...await SpeedrunCom.#gamesCompletions(d));
		} else if (d.focusedOption.name.includes("level")) {
			completions.push(...await SpeedrunCom.#levelCompletions(d));
		} else if (d.focusedOption.name.includes("category")) {
			completions.push(...await SpeedrunCom.#categoryCompletion(d));
		}
		return d.autocomplete(
			completions,
		);
	}

	@slash()
	async games(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i, signal) =>
				games(i.option("username"), { outputType: "markdown", signal }),
		);
	}

	@slash()
	async posts(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) => posts(i.option("username"), { outputType: "markdown" }),
		);
	}

	@slash("mod-count")
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
				runs(
					i.option("username"),
					i.option("game"),
					i.option("status"),
					i.option("examiner"),
					i.option<string | undefined>("emulated"),
					{ outputType: "markdown" },
				),
		);
	}

	@slash("runs-count")
	async runsCount(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) =>
				runsCount(
					i.option("username"),
					i.option("game"),
					i.option("status"),
					i.option("examiner"),
					i.option<string | undefined>("emulated"),
					{ outputType: "markdown" },
				),
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

	@slash("level-info")
	async levelInfo(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) =>
				levelInfo(
					i.option("game"),
					i.option("level"),
					{ outputType: "markdown" },
				),
		);
	}

	@slash("category-info")
	async categoryInfo(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) =>
				categoryInfo(
					i.option("game"),
					i.option("category"),
					{ outputType: "markdown" },
				),
		);
	}

	@slash("leaderboard")
	async leaderboard(i: ApplicationCommandInteraction) {
		await sendCommand(
			i,
			(i) =>
				leaderboard(
					i.option("game"),
					i.option("category"),
					i.option("subcategory"),
					{ outputType: "markdown" },
				),
		);
	}
}
