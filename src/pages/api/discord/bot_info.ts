import { client } from "./interactions.ts";

export default (): Response => {
	return new Response(JSON.stringify({
		id: client.getID(),
	}));
};
