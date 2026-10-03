#!/usr/bin/env -S deno run --allow-net=www.speedrun.com
import { GetCommentList, GetGameData, GetSearch } from "./mod.ts";
import { defaultLanguage } from "./src/constants.ts";
import type { Options } from "./src/utils/mod.ts";
import { Language } from "./src/types/language.ts";

export const parseArgs = (
	args: string[],
): {
	parsed: Record<string, string | boolean | number>;
	options: Options;
	cmd: string;
} => {
	const cmd: string = args[0];
	const parsed: Record<string, string | boolean | number> = {};
	const options: Options = { language: defaultLanguage };
	// The purpose of this block is to parse `--key value --boolKey --apples 5` to {"key": "value", boolKey: true, apples: 5}
	// Without the reliance of some external library
	// It was done this way to not require writing commands for each command
	// It's a bit overly complicated, so maybe consider cliffy?
	for (let i = 1, len = args.length; i < len; i++) {
		// For example "--key"
		const arg = args[i];
		// For example "value"
		const nextArg = args[i + 1];
		// We are only parsing -- arguments
		if (arg.startsWith("--")) {
			// Remove --
			const argName = arg.substring(2);
			// If the next argument is also a -- flag then we know the current one is meant to be a bool
			// Otherwise the current one is a key value pair
			if (nextArg && !nextArg?.startsWith("--")) {
				// Special treatment to --language and --PHPSESSID
				if (argName === "language") options.language = nextArg as Language;
				else if (argName === "PHPSESSID") options.PHPSESSID = nextArg as string;
				else {
					// Attempt to parse numbers
					// TODO: What if I want a number as a string?
					parsed[argName] = isNaN((nextArg as unknown) as number)
						? nextArg
						: Number(nextArg);
				}
				i++;
			} else {
				// TODO: What if I want false?
				parsed[argName] = true;
			}
		}
	}
	return { parsed, options, cmd };
};
const commands = { GetCommentList, GetSearch, GetGameData };

const { parsed, options, cmd } = parseArgs(Deno.args);

if (
	!cmd || cmd === "--help" || cmd === "-h" || cmd === "help" ||
	cmd === "/help" || cmd === "/h"
) {
	console.error("WARNING: This tool should only be used for testing purposes");

	console.info(
		"Available commands:",
		Object.values(commands).map((c) => c.name).join(", "),
	);
	console.info(
		"For more information check the function signature in the source files",
	);
	console.info(
		'To pass arguments use `--key value --boolKey --apples 5` to pass {"key": "value", boolKey: true, apples: 5}.',
	);
	console.info(
		"--language and --PHPSESSID have significant importance and are passed as the Accept-Language header and PHPSESSID cookie respectively and --PHPSESSID have significant importance and are passed as the Accept-Language header and PHPSESSID cookie respectively",
	);
	console.info(
		"Example: ./cli.ts GetSearch --query test --limit 1 --includeGames  --language sv-SE",
	);
	Deno.exit(1);
}

// @ts-ignore Super janky
// This whole file is made super duper generic,
// so adding new commands is as easy as adding them to the "commands" object
// Of course this opens us up to passing anything as `args`. But we'll just live with it.
console.log(JSON.stringify(await commands[cmd](parsed, options), null, "\t"));
