import { bold as boldTerminal, lowerCase } from "../../deps_general.ts";

export enum MarkupType {
	Browser,
	Markdown,
	Object,
	Plain,
	Terminal,
}

export const MARKUP: MarkupType = typeof globalThis.Deno === "undefined"
	? MarkupType.Browser
	: (Deno.noColor === true ? MarkupType.Plain : MarkupType.Markdown);

export const markupTypes = [
	MarkupType.Browser,
	MarkupType.Markdown,
	MarkupType.Object,
	MarkupType.Plain,
	MarkupType.Terminal,
];

export function stringToMarkup(s: string | null): MarkupType | undefined {
	if (typeof s === "string") {
		switch (lowerCase(s)) {
			case "browser":
				return MarkupType.Browser;
			case "markdown":
				return MarkupType.Markdown;
			case "object":
				return MarkupType.Object;
			case "plain":
				return MarkupType.Plain;
			case "terminal":
				return MarkupType.Terminal;
		}
	}
	return undefined;
}

export function isMarkupType(type: unknown): type is MarkupType {
	return typeof type === "number" && markupTypes.includes(type);
}

export class Format {
	markup: MarkupType;
	constructor(markup: MarkupType) {
		this.markup = markup;
	}
	bold(string: string, markupOpt: MarkupType = MarkupType.Plain): string {
		switch (this.markup || markupOpt) {
			case MarkupType.Browser:
				return `<b>${string}</b>`;
			case MarkupType.Markdown:
				return `**${string}**`;
			case MarkupType.Terminal:
				return boldTerminal(string);
			default:
				return string;
		}
	}

	link(
		link: string,
		name: string | false = false,
		markupOpt: MarkupType = MarkupType.Plain,
	): string {
		switch (this.markup || markupOpt) {
			case MarkupType.Markdown:
				if (name) return `[${name}](${link})`;
				/* falls through */
			default:
				return link;
		}
	}
}
