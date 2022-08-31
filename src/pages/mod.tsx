/** @jsx h */
import { h, Helmet, renderSSR, Status } from "../../deps_server.ts";

// Frontend
import Index from "./index.tsx";
import Admin from "./admin.tsx";
// API
import DiscordInteractions from "./api/discord/interactions.ts";
import ExaminedLeaderboard from "./api/srcom/examined_leaderboard.ts";
import logout from "./logout.ts";
import { ApiError, renderPage } from "../utils.ts";

const routes: Record<
	string,
	(req: Request) => Response | Promise<Response>
> = {
	"/api/discord/interactions": DiscordInteractions,
	"/api/srcom/examined-leaderboard": ExaminedLeaderboard,
	"/": Index,
	"/admin": Admin,
	"/logout": logout,
};

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
			status: Status.NotFound,
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
