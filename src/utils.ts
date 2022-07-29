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

export function fetchJSON(
	input: Request | string,
	init?: RequestInit,
): Promise<any> {
	return fetch(input, init).then((res) => res.json());
}

export function fetchText(
	input: Request | string,
	init?: RequestInit,
): Promise<string> {
	return fetch(input, init).then((res) => res.text());
}
