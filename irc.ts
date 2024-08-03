#!/usr/bin/env -S deno run --allow-net=irc.libera.chat,www.speedrun.com --allow-read --no-check --watch --no-prompt --location=http://speedrunbot-slash/
import { Client, parse, parseFlags } from "./deps_irc.ts";
import { runs } from "./src/srcom/runs.ts";
import { MarkupType } from "./src/srcom/fmt.ts";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
const LINE_DELAY = 2000;

const client = new Client({
	nick: "speedrunbot",
	channels: ["#speedrunbot"],
});

client.on("privmsg:channel", async ({ params }) => {
	const { text, target } = params;
	if (!text.startsWith("!runs")) return;
	const args = text.replace("!runs ", "");

	const argv = parse(args).filter((s) => typeof s === "string") as string[];
	const { flags } = parseFlags(argv, {
		flags: [
			{
				name: "user",
				type: "string",
				required: false,
			},
			{
				name: "game",
				type: "string",
				required: false,
			},
			{
				name: "status",
				type: "string",
				required: false,
			},
			{
				name: "examiner",
				type: "string",
				required: false,
			},
			{
				name: "emulated",
				type: "boolean",
				required: false,
			},
		],
	});
	const { user, game, status, examiner, emulated } = flags;
	const out = await runs(user, game, status, examiner, emulated, {
		outputType: MarkupType.Plain,
	});
	const lines = out.split("\n");
	for (const line of lines) {
		client.privmsg(target, line);
		await sleep(LINE_DELAY);
	}
});

client.on("notice:private", ({ source, params }) => {
	console.log(`${source?.name} notices to you: ${params.text}`);
});

await client.connect("irc.libera.chat", 6697, true);
