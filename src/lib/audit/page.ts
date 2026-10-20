// shortcut: regex-based HTML reading, good for well-formed pages; swap for HTMLRewriter
// if real sites start producing wrong counts.

export interface ParsedPage {
	title: string;
	description: string;
	h1Count: number;
	canonical: string;
	noindex: boolean;
	lang: string;
	viewport: boolean;
	generator: string;
	jsonLd: number;
	images: number;
	imagesWithoutAlt: number;
	words: number;
	links: string[];
}

const ENTITIES: Record<string, string> = {
	amp: "&",
	quot: '"',
	apos: "'",
	lt: "<",
	gt: ">",
	nbsp: " ",
};

function decode(text: string): string {
	return text
		.replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
		.replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(Number.parseInt(n, 16)))
		.replace(/&([a-z]+);/gi, (m, name: string) => ENTITIES[name.toLowerCase()] ?? m)
		.replace(/\s+/g, " ")
		.trim();
}

function attr(tag: string, name: string): string | undefined {
	const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
	if (!m) return undefined;
	return decode(m[1] ?? m[2] ?? m[3] ?? "");
}

function tags(html: string, name: string): string[] {
	return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];
}

export function parsePage(html: string, baseUrl: string): ParsedPage {
	const metas = tags(html, "meta");
	const meta = (key: string): string | undefined => {
		const tag = metas.find((t) => (attr(t, "name") ?? attr(t, "property"))?.toLowerCase() === key);
		return tag ? attr(tag, "content") : undefined;
	};

	const canonicalTag = tags(html, "link").find((t) =>
		(attr(t, "rel") ?? "").toLowerCase().split(" ").includes("canonical"),
	);
	const images = tags(html, "img");

	const links = new Set<string>();
	for (const a of tags(html, "a")) {
		const href = attr(a, "href");
		if (!href || /^(mailto|tel|javascript|data):/i.test(href)) continue;
		try {
			const url = new URL(href, baseUrl);
			url.hash = "";
			if (url.protocol === "http:" || url.protocol === "https:") links.add(url.href);
		} catch {
			// a malformed href is the page's problem, not a reason to stop reading it
		}
	}

	const text = html
		.replace(/<head\b[\s\S]*?<\/head>/i, " ")
		.replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, " ")
		.replace(/<!--[\s\S]*?-->/g, " ")
		.replace(/<[^>]+>/g, " ");

	return {
		title: decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""),
		description: meta("description") ?? "",
		h1Count: (html.match(/<h1[\s>]/gi) ?? []).length,
		canonical: canonicalTag ? (attr(canonicalTag, "href") ?? "") : "",
		noindex: /noindex/i.test(meta("robots") ?? ""),
		lang: attr(tags(html, "html")[0] ?? "", "lang") ?? "",
		viewport: meta("viewport") !== undefined,
		generator: meta("generator") ?? "",
		jsonLd: (html.match(/<script[^>]*application\/ld\+json/gi) ?? []).length,
		images: images.length,
		imagesWithoutAlt: images.filter((t) => attr(t, "alt") === undefined).length,
		words: decode(text)
			.split(" ")
			.filter((w) => /\p{L}/u.test(w)).length,
		links: [...links],
	};
}
