import { bold as boldTerminal } from "../../deps_general.ts";

export const MARKUP: MarkupType = typeof globalThis.Deno === "undefined"
	? "browser"
	: (Deno.noColor === true ? "plain" : "markdown");

export type MarkupType =
	| "browser"
	| "plain"
	| "markdown"
	| "terminal"
	| "object";

export const markupTypes = [
	"browser",
	"plain",
	"markdown",
	"terminal",
	"object",
];

export function isMarkupType(type: unknown): type is MarkupType {
	if (typeof type === "string" && markupTypes.includes(type)) return true;
	else return false;
}

export class Format {
	markup: MarkupType;
	constructor(markup: MarkupType) {
		this.markup = markup;
	}
	bold(string: string, markupOpt: MarkupType = "plain"): string {
		switch (this.markup || markupOpt) {
			case "browser":
				return `<b>${string}</b>`;
			case "markdown":
				return `**${string}**`;
			case "terminal":
				return boldTerminal(string);
			default:
				return string;
		}
	}

	link(
		link: string,
		name: string | false = false,
		markupOpt: MarkupType = "plain",
	): string {
		switch (this.markup || markupOpt) {
			case "markdown":
				if (name) return `[${name}](${link})`;
				/* falls through */
			default:
				return link;
		}
	}
}
