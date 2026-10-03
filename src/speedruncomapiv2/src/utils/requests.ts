import { getSetCookies, setCookie } from "../../deps.ts";
import {
	accept,
	acceptHeader,
	acceptLanguageHeader,
	baseUrl,
	contentType,
	contentTypeHeader,
	PHPSESSIDCookie,
	userAgent,
	userAgentHeader,
} from "../constants.ts";
import { Language } from "../types/mod.ts";
import { SpeedruncomError } from "./SpeedruncomError.ts";

export interface RequestInitProp extends RequestInit {
	// Magical JSON.stringify stuff is done here
	/**
	 * Body that will automatically get JSON.stringify-ed if the content-type header is not set
	 */
	// deno-lint-ignore no-explicit-any
	body?: BodyInit | any | null | undefined;
	/**
	 * `params` is used to pass query parameters
	 *
	 * Speedrun.com uses query parameters in a special maner
	 * 1. Run JSON.stringify the object
	 * 2. Base 64 encode the result
	 * 3. Pass it as the _r query parameter
	 */
	// deno-lint-ignore no-explicit-any
	params?: any;
	/**
	 * Any locale that speedrun.com supports
	 *
	 * If not provided a 400 error will be thrown!!!
	 *
	 * @default en-US
	 */
	language: Language;
	/**
	 * Only used for authenticated requests
	 */
	PHPSESSID?: string;
}

/**
 * This function really is a wrapper around the Web API "fetch"
 *
 * It does a couple of magic for us to make it easier to work with this library
 *
 * 1. Sets the "User-Agent" header
 * 2. Sets the "Contnet-Type" header
 * 3. JSON stringifies the body
 * 4. Encodes paramters as base 64 and sets the result as the _r query parameter, as well as removes padding
 * 5. Gives a base url
 *
 * The above are not done if url is a Request object
 * Which is intended as an escape hatch
 *
 * Additionally the body is parsed as JSON and returned
 *
 * If an error happens then the promise will throw wrapped in an "SpeedruncomError" object
 *
 * @param url If this is a string will be appended to the base URL of speedrun.com's API
 * @param init Same as RequestInit with the addition of `params`, `language`, `PHPSESSID`, and enhanced `bodỳ` argument
 * @returns Whatever speedrun.com returns
 * @throws If the response is not ok (above 299) the promise will be rejected with a SpeedruncomError
 */
export async function requests(
	url: string | URL | Request,
	init?: RequestInitProp,
): Promise<unknown>;
export async function requests(request: Request): Promise<unknown>;
export async function requests(
	url: string | URL | Request,
	init: RequestInitProp = { language: Language.en },
): Promise<unknown> {
	// Escape hatch for Request objects
	if (url instanceof Request) {
		const res = await fetch(url);
		if (res.ok) {
			return res.json();
		} else {
			throw new SpeedruncomError(res.status, await res.text());
		}
	}

	// It's a bit easier to work with a Headers object
	const headers = new Headers(init?.headers);

	// If a user agent is not provided then add one
	if (!headers.has(userAgentHeader)) {
		headers.set(userAgentHeader, userAgent);
	}
	// If a content type is not provided then add one
	// Usually JSON is what we are sending anyway
	// Double check that we actually have a body to send and that it's not already a string
	if (
		!headers.has(contentTypeHeader) && init.body &&
		typeof init?.body !== "string"
	) {
		headers.set(contentTypeHeader, contentType);
		init.body = JSON.stringify(init?.body);
	}

	// Required header
	headers.set(acceptLanguageHeader, init.language);
	// This is for being polite, I don't think speedrun.com sends anything but json
	headers.set(acceptHeader, accept);

	if (init.PHPSESSID) {
		setCookie(headers, { name: PHPSESSIDCookie, value: init.PHPSESSID });
	}

	const finalUrl = url instanceof URL
		? url
		// While going through the whole _r=base64String thing is not needed, it is what speedrun.com does
		// As such we'll be nice and do the same
		: `${baseUrl}${url}?${
			init.params
				? new URLSearchParams({
					_r: btoa(JSON.stringify(init.params)).replaceAll(/(=+)$/g, ""),
				})
				// Uncomment this to not do base 64 encoding stuff, and comment the 3 lines above
				// ? new URLSearchParams(init.params)
				: ""
		}`;
	const res = await fetch(
		finalUrl,
		{ ...init, headers },
	);
	if (res.ok) {
		// Really only used for the sign up and login process
		const cookies = getSetCookies(res.headers);
		const PHPSESSID = cookies.find((c) => c.name === PHPSESSIDCookie);
		return res.json().then((obj) => ({ ...obj, PHPSESSID }));
	} else {
		throw new SpeedruncomError(res.status, await res.text());
	}
}
