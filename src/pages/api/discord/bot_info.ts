import { client } from "./interactions.ts";

export interface BotInfo {
	id: string;
	owners: string[];
}

export const handler = {
	async GET(): Promise<Response> {
		const applicationInfo = await client.fetchApplication();
		return new Response(JSON.stringify({
			id: client.getID(),
			owners: applicationInfo.team
				? applicationInfo.team.members.map((user) => user.id)
				: [applicationInfo.owner?.id],
		}));
	},
};
