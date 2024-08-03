/** @jsx h */
import { h, STATUS_CODE } from "../../deps_server.ts";

// Frontend
import Index from "./index.tsx";
import Admin from "./admin.tsx";
import Command from "./command.tsx";
// API
import DiscordInteractions from "./api/discord/interactions.ts";
import ExaminedLeaderboard from "./api/v1/srcom/examined_leaderboard.ts";
import logout from "./logout.ts";
import { ApiError, renderPage } from "../utils.ts";
import { commands } from "../srcom/slash_commands.tsx";

const routes: Record<
	string,
	(req: Request) => Response | Promise<Response>
> = {
	"/api/discord/interactions": DiscordInteractions,
	"/api/v1/srcom/examined-leaderboard": ExaminedLeaderboard,
	"/": Index,
	"/admin": Admin,
	"/logout": logout,
};

for (const c of commands) {
	routes[`/command/${c.name}`] = Command;
}

export async function handler(req: Request): Promise<Response> {
	const { pathname } = new URL(req.url);

	// Check if the requested route is available
	if (Object.keys(routes).includes(pathname)) {
		try {
			return await routes[pathname](req);
		} catch (err) {
			console.error(err);
			if (err instanceof ApiError) {
				return new Response(JSON.stringify({ message: err.message }), {
					status: err.status,
					headers: {
						"Content-Type": "application/json",
					},
				});
			} else return new Response(err);
		}
	} // If the route is not available
	// And the client expects an api route
	// Return as JSON
	else if (pathname.includes("api")) {
		return Response.json({
			message: "Not found",
		}, {
			status: STATUS_CODE.NotFound,
		});
	} // Else return a nice website
	else return renderPage(<NotFound pathname={pathname} />);
}

function NotFound({ pathname }: {
	pathname: string;
}) {
	return (
		<div>
			<h1>
				Not found
			</h1>
			<p>
				Sorry, but we couldn't find {pathname}.
			</p>
			<p>
				Want to go to the
				<a href="/">
					Home page?
				</a>
			</p>
		</div>
	);
}
