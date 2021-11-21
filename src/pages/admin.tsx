/** @jsx h */
import { h, IS_BROWSER, useEffect, useState } from "../deps_frontend.ts";
import type { PageConfig } from "../deps_frontend.ts";
import { DISCORD_URL } from "../utils.ts";
import type { BotInfo } from "./api/discord/bot_info.ts";
import type { Token } from "./api/discord/token.ts";

export const config: PageConfig = { runtimeJS: true };

export default function Admin() {
	const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
	const [code, setCode] = useState("");
	const [token, setToken] = useState("");
	const [status, setStatus] = useState("");
	useEffect(() => {
		setStatus("Fetching bot info");
		fetch("/api/discord/bot_info").then((res) => res.json()).then((data) =>
			setBotInfo(data)
		).then(() => setStatus("Fetched bot info!"));
	}, [setBotInfo, setStatus]);

	useEffect(() => {
		if (IS_BROWSER) {
			const url = new URL(location.href);
			if (url.searchParams.has("code")) setCode(url.searchParams.get("code")!);
		}
	}, [setCode]);

	useEffect(() => {
		if (!code) return;
		setStatus("Fetching token");
		fetch(`/api/discord/token`, {
			method: "POST",
			body: JSON.stringify({
				code,
				redirect_uri: location.origin + location.pathname,
			}),
		}).then(async (res) => {
			const data = await res.json() as Token;
			if (res.ok) {
				setToken(data.access_token);
			} else {
				// @ts-ignore if it's an error the response will be unexpected
				setStatus(`Error: ${data.error_description}`);
				setCode("");
			}
		});
	}, [code, setToken]);

	const reload = () => {
		if (!token) return;
		setStatus("Reloading commands");
		fetch("/api/discord/reload", {
			method: "POST",
			body: JSON.stringify({ access_token: token }),
			headers: {
				"Content-Type": "application/json",
			},
		}).then((res) => res.json()).then((data) => setStatus(data.message));
	};

	return (
		<div>
			<h1>Speedrun.bot admin panel</h1>
			<p>{status}</p>
			{!code
				? (botInfo?.id
					? (
						<a
							href={`${DISCORD_URL}/oauth2/authorize?client_id=${botInfo.id}&scope=identify&response_type=code&redirect_uri=${
								encodeURIComponent(location.origin + location.pathname)
							}`}
						>
							Click here to log in
						</a>
					)
					: "Loading...")
				: <button onClick={reload}>Reload commands?</button>}
		</div>
	);
}
