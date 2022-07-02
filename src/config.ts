import { config as dotenvConfig } from "../deps_server.ts";

const variables = [
	"TOKEN",
	"CLIENT_SECRET",
	"TEST_SERVER",
	"PUBLIC_KEY",
];

// Check if we are allowed to read these variables from the enviorment
const permissionTasks: Promise<
	{ variable: string; state: Deno.PermissionState }
>[] = [];
for (const variable of variables) {
	permissionTasks.push(
		Deno.permissions.query({ name: "env", variable }).then((perms) => ({
			state: perms.state,
			variable,
		})),
	);
}

const variablesPermissions = await Promise.all(permissionTasks);
// Read from .env file first
export const config: Record<string, string | undefined> = {
	...await dotenvConfig({
		export: false,
		// @ts-ignore This can be false trust me dude
		defaults: false,
	}),
};

// Overwrite .env variables with variables from the enviorment
// Is this expected behaviour?
for (const variable of variablesPermissions) {
	if (variable.state === "granted") {
		config[variable.variable] ||= Deno.env.get(variable.variable);
	}
}
