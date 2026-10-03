import { Language } from "./types/mod.ts";

export const baseUrl = "https://www.speedrun.com/api/v2";
export const userAgent = "speedruncomapiv2/v0";
export const userAgentHeader = "User-Agent";
export const contentType = "application/json";
export const contentTypeHeader = "Content-Type";
export const acceptHeader = "Accept";
export const accept = contentType;
export const acceptLanguageHeader = "Accept-Language";
export const defaultLanguage = Language.en;
export const cookieHeader = "Cookie";
export const PHPSESSIDCookie = "PHPSESSID";
