import {
  Embed,
  handle,
  init,
} from "https://deno.land/x/harmony@v2.1.3/deploy.ts";
import { games } from "./srcom/games.ts";

init({ env: true });

handle("games", async (i) => {
  const [username] = i.options.map((opt) => opt.value);
  const [title, ...content] =
    (await games(username, { outputType: "markdown" })).split("\n");

  const embed = new Embed({
    title: title,
    description: content.join("\n"),
  });

  i.send(embed);
});
