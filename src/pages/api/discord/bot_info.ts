import { client } from "./interactions.ts";

export interface BotInfo {
  id: string;
  owners: string[];
}

export default async (): Promise<Response> => {
  const applicationInfo = await client.fetchApplication();
  return new Response(JSON.stringify({
    id: client.getID(),
    owners: applicationInfo.team
      ? applicationInfo.team.members.map((user) => user.id)
      : [applicationInfo.owner?.id],
  }));
};
