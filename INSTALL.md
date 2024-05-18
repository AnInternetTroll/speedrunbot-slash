# Installation guide

speedrunbot-slash is a discord bot written for the Deno runtime, and as such
supports running in the following environments:

- Deno Deploy
- A podman/docker container
- Bare metal on supported platforms

The bot supports the following environment variables:

- TOKEN
  - Required Discord bot token.
- PUBLIC\_KEY
  - Required application public key used when using the "Interactions Endpoint
    URL".
- CLIENT\_SECRET
  - Optional application client secret used for the admin panel.
- TEST\_SERVER
  - Optional guild ID used to update the slash commands quicker in one
    particular server.

## Deno Deploy

When running on deno deploy the following environmental variables MUST be set:

- TOKEN
- PUBLIC\_KEY

The discord bot must be configured to receive interactions through the
"Interactions Endpoint URL", which must be set to
`https://$PROJECT_ID.deno.dev/api/discord/interactions`

[For more information on deno deploy's domains read their
documentation](https://docs.deno.com/deploy/manual/custom-domains)

## Container

When running in a container the TOKEN environmental variable MUST be set. This
can either be set in a .env file in CWD or as environmental variables.

The bot can be ran in docker or podman with the provided Containerfile.

To build the image run:

```sh
podman build -t speedrunbot-slash .
```

And to run it:

```sh
podman run \
	--env-file=.env \
	--rm \
	--interactive \
	--tty \
	--publish "8000:8000" \
	--name "speedrunbot-slash" \
	localhost/speedrunbot-slash:latest
```

When running the bot this way the website is fully optional, and the bot can run
just fine without it.

Just remove the `--publish "8000:8000"` argument and don't define the

## Bare metal

The bot can also be ran in any environment where deno is available.

When running on bare metal the TOKEN environmental variable MUST be set. This
can either be set in a .env file in CWD or as environmental variables.

```sh
./main.ts
```

# Admin panel

The admin panel currently has one purpose, and that is to tell discord when any
commands have changed names or arguments. If unsure then use this after an
update to make sure the bot functions correctly

The admin panel is available at the `/admin` endpoint, with a "Reload commands?"
button.
