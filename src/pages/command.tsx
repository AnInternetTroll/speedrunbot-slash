/** @jsx h */
import {
	ApplicationCommandPartial,
	h,
	SlashCommandOptionType,
} from "../../deps_server.ts";
import { MarkupType } from "../srcom/fmt.ts";
import { runs } from "../srcom/runs.ts";
import { commands } from "../srcom/slash_commands.tsx";
import { renderPage } from "../utils.ts";

export default (req: Request) => Command({ req });

export interface CommandProps {
	req: Request;
}

const ROUTE = new URLPattern({ pathname: "/command/:name" });

export async function Command({ req }: CommandProps) {
	const match = ROUTE.exec(req.url);
	if (!match) return "oh oh";
	const cmd = commands.find((c) => match.pathname.groups.name === c.name);
	if (
		!match.pathname.groups.name ||
		!cmd
	) {
		return "command not found";
	}
	const url = new URL(req.url);
	// const params = new URLSearchParams(req.url);
	const params = url.searchParams;
	const out = await executeCommand(cmd.name, params);
	return renderPage(<Page out={out} cmd={cmd} params={params} />);
}

interface PageProps {
	cmd: ApplicationCommandPartial;
	out: string;
	params: URLSearchParams;
}

function Page({ cmd, out, params }: PageProps) {
	const [header, ...rows] = out.split("\n");
	return (
		<div>
			<h1>Speedrun.bot</h1>
			<p>
				This is the command page of speedrun.bot
			</p>
			<form>
				{cmd.name}
				{cmd.options?.map((o) => {
					switch (o.type) {
						case SlashCommandOptionType.STRING:
							return (
								<label>
									{o.name}
									<input name={o.name} type="text" />
								</label>
							);
						case SlashCommandOptionType.BOOLEAN:
							// <input name={o.name} type="checkbox" />
							return (
								<label>
									{o.name}
									<select name={o.name}>
										<option value="undefined">
											Both
										</option>
										<option value="false">
											No
										</option>
										<option value="true">
											Yes
										</option>
									</select>
								</label>
							);
					}
				})}
				<button type="submit" action="GET">Execute</button>
			</form>
			<h2>{header}</h2>
			<ul>
				{rows.map((r) => <li
					dangerouslySetInnerHTML={{ __html: r }}
					key={r}
				/>)}
			</ul>
		</div>
	);
}

async function executeCommand(
	command: string,
	args: URLSearchParams,
): Promise<string> {
	switch (command) {
		case "runs": {
			const user = args.get("username")!;
			const game = args.get("game")!;
			const status = args.get("status")!;
			const examiner = args.get("examiner")!;
			const emulated = args.get("emulated")!;
			console.log(user, game, status, examiner, emulated, args);

			try {
				return await runs(
					user,
					game,
					status,
					examiner,
					emulated,
					{ outputType: MarkupType.Browser },
				);
			} catch (err) {
				console.error(err);
				return err.message;
			}
		}
	}
	return "Undefined";
}
