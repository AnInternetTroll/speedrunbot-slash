import { deleteCookie, STATUS_CODE } from "../../deps_server.ts";

export default (_req: Request): Response => {
	const headers = new Headers();
	headers.set("Location", "/");
	deleteCookie(headers, "access_token");
	return new Response(null, {
		headers,
		status: STATUS_CODE.TemporaryRedirect,
	});
};
