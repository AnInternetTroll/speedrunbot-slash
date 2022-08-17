import { Helmet, renderSSR } from "../deps_server.ts";

export const DISCORD_URL = "https://discord.com/api/v9";

export const isDeployed = (await Deno.permissions.query({
			name: "env",
			variable: "DENO_DEPLOYMENT_ID",
		})).state === "granted" && !!Deno.env.get("DENO_DEPLOYMENT_ID");

export function renderPage(page: JSX.IntrinsicElements, init?: ResponseInit) {
	const { body, head, footer, attributes } = Helmet.SSR(renderSSR(
		page,
	));
	return new Response(
		`
<!DOCTYPE html>
<html ${attributes.html.toString()}>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${head.join("\n")}
    </head>
    <body ${attributes.body.toString()}>
        ${body}
        ${footer.join("\n")}
    </body>
</html>
`,
		{
			...init,
			headers: {
				"content-type": "text/html",
				...init?.headers,
			},
		},
	);
}
export type Json<T> = T extends boolean | number | string | null ? T
	: T extends Array<(infer U)> ? JsonArray<U>
	: // deno-lint-ignore ban-types
	T extends object ? { [K in keyof T]: Json<T[K]> }
	: never;

// deno-lint-ignore no-empty-interface
interface JsonArray<T> extends Array<Json<T>> {}

export function apiResponse(obj: JSON | string) {
	let output: string;
	if (typeof obj === "string") output = JSON.stringify({ message: obj });
	else if (typeof obj === "object") output = JSON.stringify(obj);
	else throw new Error("Unexpected output");

	return new Response(output, {
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export class ApiError extends Error {
	readonly status: number;
	constructor(msg?: string, options?: ErrorOptions & { status: number }) {
		super(msg, options);
		this.status = options?.status || 500;
	}
}
