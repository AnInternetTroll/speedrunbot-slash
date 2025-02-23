/** @jsx h */
import {
	deleteCookie,
	getCookies,
	h,
	setCookie,
	STATUS_CODE,
} from "../../deps_server.ts";
import { DISCORD_URL, renderPage } from "../utils.ts";
import { client } from "../client.ts";
import { config } from "../config.ts";
import { SpeedRunBot } from "../standalone_client.ts";
import { commands } from "../srcom/slash_commands.tsx";

// User structure that comes from discord
interface User {
	id: string;
	username: string;
	discriminator: string;
	avatar: string;
	verified: boolean;
	email: string;
	flags: number;
	banner: string;
	accent_color: number;
	premium_type: number;
	public_flags: number;
}

// Access token response from discord
interface AccessTokenResponse {
	access_token: string;
	token_type: "Bearer";
	expires_in: number;
	refresh_token: string;
	scope: string;
}

// The application has the team/owner of the bot
// Which is used to see if the client has permission to reload the commands
const application = await client.fetchApplication();

export default async (req: Request): Promise<Response> => {
	const { pathname, searchParams, origin } = new URL(req.url);
	const location = `${origin}${pathname}`;
	const code = searchParams.get("code");
	const access_token = getCookies(req.headers).access_token;

	if (req.method === "DELETE") {
		const headers = new Headers();
		deleteCookie(headers, "access_token");

		return renderPage(
			<Admin location={location} message="Logged out!" />,
		);
	} // The user has triggered a reload
	else if (req.method === "POST") {
		if (!access_token) {
			return renderPage(
				<Admin location={location} message="Not logged in" />,
			);
		}
		const user = await getUserFromToken(access_token);
		if (isUserAnOwner(user)) {
			// reload commands
			const client = new SpeedRunBot({
				intents: [],
				token: config.TOKEN,
			});
			await client.connect();
			await client.interactions.commands.bulkEdit(
				commands,
				config.TEST_SERVER,
			);
			return renderPage(
				<Admin location={location} message="Commands succesfully updated!" />,
			);
		} else {
			return renderPage(
				<Admin location={location} message="Access denied" />,
			);
		}
	} // The user just came back from discord
	// And authorized the app
	else if (code) {
		const headers = new Headers({
			"Location": location,
		});

		const access_token = await exchangeCodeForToken(code, location);

		setCookie(headers, {
			name: "access_token",
			httpOnly: true,
			value: access_token,
		});

		return new Response(null, {
			headers,
			status: STATUS_CODE.TemporaryRedirect,
		});
	} // The user is now logged in
	else if (access_token) {
		const user = await getUserFromToken(access_token);
		return renderPage(<Admin location={location} user={user} />);
	} else return renderPage(<Admin location={location} />);
};

export function Admin(
	{ user, location, message }: {
		user?: User;
		location: string;
		message?: string;
	},
) {
	return (
		<div>
			<h1>
				Speedrun.bot admin panel
			</h1>

			<h2>
				{message}
			</h2>

			{!user
				? (client.id
					? (
						<a
							href={`${DISCORD_URL}/oauth2/authorize?client_id=${client.id}&scope=identify&response_type=code&redirect_uri=${
								encodeURIComponent(location)
							}`}
						>
							Click here to log in
						</a>
					)
					: "Loading...")
				: (
					// If the authorized user is in the team
					// Or is the owner of the application
					// Allow them to reload commands
					isUserAnOwner(user)
						? (
							<form method="POST">
								<button type="submit">
									Reload commands?
								</button>
							</form>
						)
						: "Access denied"
				)}
			{user && (
				<form action="/logout">
					<button type="submit">
						Log out
					</button>
				</form>
			)}
		</div>
	);
}

async function exchangeCodeForToken(
	code: string,
	redirect_uri: string,
): Promise<string> {
	const client_secret = config.CLIENT_SECRET;
	if (!client_secret) {
		throw new Error(
			"CLIENT_SECRET is not set!!! Tell an admin about this. Wait, you're the admin?",
		);
	}

	// https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-access-token-response
	const res = await fetch(`${DISCORD_URL}/oauth2/token`, {
		method: "POST",
		body: new URLSearchParams({
			"client_id": typeof client.id === "function" ? client.id() : client.id,
			client_secret,
			"grant_type": "authorization_code",
			code,
			redirect_uri,
		}).toString(),
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	});
	const data = await res.json() as AccessTokenResponse;
	return data.access_token;
}

async function getUserFromToken(access_token: string): Promise<User> {
	const res = await fetch(`${DISCORD_URL}/users/@me`, {
		headers: {
			"Authorization": `Bearer ${access_token}`,
		},
	});
	const user = await res.json() as User;
	return user;
}

function isUserAnOwner(user: User): boolean {
	return application.team?.members.map((user) => user.id).includes(user.id) ||
		application.owner?.id === user.id;
}
