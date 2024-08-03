/** @jsx h */
import { h } from "../../deps_server.ts";
import { client } from "../client.ts";
import { commands } from "../srcom/slash_commands.tsx";
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
						href={`${DISCORD_URL}/oauth2/authorize?client_id=${id}&scope=applications.commands`}
					>
						Click here to invite the bot!
					</a>
				)
				: "Loading..."}
			<div>
				<p>Command</p>
				<ul>
					{commands.map((c) => (
						<li key={c.name}>
							<a href="TODO">
								{c.name}
							</a>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
