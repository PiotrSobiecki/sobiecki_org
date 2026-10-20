import assert from "node:assert/strict";
import { test } from "node:test";
import { parsePage } from "../../src/lib/audit/page.ts";

test("parsePage reads what the SEO checks need from a page", () => {
	const page = parsePage(
		`<!doctype html><html lang="pl"><head>
    <title> Koncerty &amp; muzyka </title>
    <meta name="description" content='Opis "strony"'>
    <meta name="robots" content="noindex, follow">
    <meta name="generator" content="WordPress 6.4.2">
    <link rel="canonical" href="https://example.com/">
    <script type="application/ld+json">{"@type":"Organization"}</script>
    <style>.a { color: red }</style>
    </head><body>
    <h1>Jeden</h1><h1 class="x">Dwa</h1>
    <img src="a.jpg" alt="zdjęcie"><img src="b.jpg"><img src="c.jpg" alt="">
    <a href="/o-nas#zespol">O nas</a> <a href="mailto:x@example.com">mail</a>
    <a href="https://other.com/x">obcy</a> <a href="http://[bad">zły</a>
    <script>var hidden = "nie liczę tych słów";</script>
    <p>Trzy proste słowa.</p>
    </body></html>`,
		"https://example.com/",
	);

	assert.equal(page.title, "Koncerty & muzyka");
	assert.equal(page.description, 'Opis "strony"');
	assert.equal(page.noindex, true);
	assert.equal(page.generator, "WordPress 6.4.2");
	assert.equal(page.canonical, "https://example.com/");
	assert.equal(page.lang, "pl");
	assert.equal(page.viewport, false);
	assert.equal(page.jsonLd, 1);
	assert.equal(page.h1Count, 2);
	assert.equal(page.images, 3);
	assert.equal(page.imagesWithoutAlt, 1);
	assert.deepEqual(page.links, ["https://example.com/o-nas", "https://other.com/x"]);
	assert.equal(page.words, 10);
});
