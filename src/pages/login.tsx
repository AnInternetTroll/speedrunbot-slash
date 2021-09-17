/** @jsx h */
import { h, IS_BROWSER, useEffect, useState } from "../deps.ts";
import { DISCORD_URL } from "../utils.ts";

export default function Login() {
	const [state, setState] = useState("");
	const [id, setId] = useState("");
	useEffect(() => {
		fetch("/api/discord/bot_info").then((res) => res.json()).then((data) =>
			setId(data.id)
		);
	}, [setId]);
	useEffect(() => {
		const url = new URL(location.href);
		const code = url.searchParams.get("code");
		if (code) {
			fetch("/api/discord/token", {
				method: "POST",
				body: JSON.stringify({ code }),
				headers: {
					"Content-Type": "application/json",
				},
			}).then((res) => res.json()).then(setState);
		}
	}, [setState]);
	return (
		<div>
			<h1>Speedrun.bot</h1>
			<p>
				Press the button below to login
			</p>
			<span>{JSON.stringify(state, null, 4)}</span>
			{IS_BROWSER
				? (
					<a
						href={`${DISCORD_URL}/oauth2/authorize?${new URLSearchParams({
							response_type: "code",
							client_id: id,
							scope: "guilds",
							redirect_uri: encodeURI(`${location.origin}${location.pathname}`),
						})}`}
					>
						Click me!
					</a>
				)
				: "Can't get the link"}
		</div>
	);
}
