/** @jsx h */
import { h, IS_BROWSER, useState } from "../deps.ts";
import { client } from "../deps_harmony.ts";
import { DISCORD_URL } from "../utils.ts";

export default function Login() {
	const [state, setState] = useState("");
	if (IS_BROWSER) {
		const url = new URL(location.href);
		const code = url.searchParams.get("code");
		if (code) {
			fetch("/api/login", {
				method: "POST",
				body: JSON.stringify({ code }),
				headers: {
					"Content-Type": "application/json",
				},
			}).then((res) => res.json()).then(setState);
		}
	}
	return (
		<div>
			<h1>Speedrun.bot</h1>
			<p>
				Press the button below to login
			</p>
			<span>{JSON.stringify(state, null, 4)}</span>
			{!IS_BROWSER
				? (
					<a
						href={`${DISCORD_URL}/oauth2/authorize?${new URLSearchParams({
							response_type: "code",
							client_id: client.getID(),
							scope: "guilds",
							redirect_uri: encodeURI("http://0.0.0.0:8000/login"),
						})}`}
					>
						Click me!
					</a>
				)
				: "Can't get the link"}
		</div>
	);
}
