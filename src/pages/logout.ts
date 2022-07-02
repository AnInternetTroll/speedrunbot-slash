import { deleteCookie, Status } from "../../deps_server.ts";

export default (req: Request): Response => {
	const headers = new Headers();
	headers.set("Location", req.headers.get("referer") || "/");
	deleteCookie(headers, "access_token");
	return new Response(null, {
		headers,
		status: Status.TemporaryRedirect,
	});
};
