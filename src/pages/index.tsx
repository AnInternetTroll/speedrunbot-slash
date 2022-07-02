/** @jsx h */
import { h } from "../../deps_server.ts";
import { client } from "../client.ts";
import { DISCORD_URL, renderPage } from "../utils.ts";

export default () => renderPage(<Home />);

export function Home() {
	const id = client.id;
	return (
		<div>
			<h1>Speedrun.bot</h1>
			<p>
				This is the home page of speedrun.bot
			</p>
			{id
				? (
					<a
						href={`${DISCORD_URL}/authorize?client_id=${id}&scope=applications.commands`}
					>
						Click here to invite the bot!
					</a>
				)
				: "Loading..."}
		</div>
	);
}
