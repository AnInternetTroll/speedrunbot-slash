/** @jsx h */
import { h, Helmet, renderSSR, Status } from "../../deps_server.ts";

// Frontend
import Index from "./index.tsx";
import Admin from "./admin.tsx";
// API
import DiscordInteractions from "./api/discord/interactions.ts";
import logout from "./logout.ts";
import { renderPage } from "../utils.ts";

const routes: Record<
	string,
	(req: Request) => Response | Promise<Response>
> = {
	"/api/discord/interactions": DiscordInteractions,
	"/": Index,
	"/admin": Admin,
	"/logout": logout,
};

export function handler(req: Request): Response | Promise<Response> {
	const { pathname } = new URL(req.url);

	// Check if the requested route is available
	if (Object.keys(routes).includes(pathname)) {
		return routes[pathname](req);
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
