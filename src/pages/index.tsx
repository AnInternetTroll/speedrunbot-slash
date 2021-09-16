/** @jsx h */
import { h, IS_BROWSER, useState } from "../deps.ts";
import { client } from "../deps_harmony.ts";
import { DISCORD_URL } from "../utils.ts";

export default function Home() {
	return (
		<div>
			<h1>Speedrun.bot</h1>
			<p>
				This is the home page of speedrun.bot
			</p>
			{!IS_BROWSER
				? (
					<a
						href={`${DISCORD_URL}/authorize?client_id=${client.getID()}&scope=applications.commands`}
					>
						Click here to invite the bot!
					</a>
				)
				: "Can't get the invite"}
		</div>
	);
}
