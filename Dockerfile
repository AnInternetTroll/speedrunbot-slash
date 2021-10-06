# syntax=docker/dockerfile:1
FROM denoland/deno:1.14.3

# The port that your application listens to.
EXPOSE 8000

WORKDIR /app

# Prefer not to run as root.
USER deno

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
COPY src/deps_frontend.ts .
COPY src/deps_server.ts .
COPY src/deps_general.ts .
RUN deno cache --no-check deps_general.ts deps_server.ts deps_frontend.ts

# These steps will be re-run upon each file change in your working directory:
ADD . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache --no-check src/mod.ts

CMD ["run", "--allow-net", "--allow-env", "--allow-read=.", "--no-check", "./src/mod.ts"]
