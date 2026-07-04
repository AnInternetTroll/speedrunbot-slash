/** @jsx h */
import { h, STATUS_CODE } from "../../deps_server.ts";

// Frontend
import Index from "./index.tsx";
import Admin from "./admin.tsx";
// API
import DiscordInteractions from "./api/discord/interactions.ts";
import ExaminedLeaderboard from "./api/v1/srcom/examined_leaderboard.ts";
import Runs from "./api/v1/srcom/runs.ts";
import WorldRecord from "./api/v1/srcom/world_record.ts";
import logout from "./logout.ts";
import { ApiError, corsHeaders, renderPage } from "../utils.ts";

const routes: Record<
	string,
	(req: Request) => Response | Promise<Response>
> = {
	"/api/discord/interactions": DiscordInteractions,
	"/api/v1/srcom/examined-leaderboard": ExaminedLeaderboard,
	"/api/v1/srcom/runs": Runs,
	"/api/v1/srcom/world-record": WorldRecord,
	"/": Index,
	"/admin": Admin,
	"/logout": logout,
};

function isApiRoute(pathname: string) {
	return pathname.startsWith("/api/");
}

export async function handler(req: Request): Promise<Response> {
	const { pathname } = new URL(req.url);

	// Check if the requested route is available
	if (Object.keys(routes).includes(pathname)) {
		if (req.method === "OPTIONS" && isApiRoute(pathname)) {
			return new Response(null, {
				headers: corsHeaders,
			});
		}
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
			} else return new Response("An unexpected error has occured");
		}
	} // If the route is not available
	// And the client expects an api route
	// Return as JSON
	else if (isApiRoute(pathname)) {
		return Response.json({
			message: "Not found",
		}, {
			status: STATUS_CODE.NotFound,
		});
	} // Else return a nice website
	else {return renderPage(<NotFound pathname={pathname} />, {
			status: STATUS_CODE.NotFound,
		});}
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
