import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

// The same audit runs on audyt.sobiecki.org (repo "automatyzacja, seo, audyt"); these
// folders must stay byte-identical there. Skipped where that repo is not checked out (CI).
const ROOT = resolve(import.meta.dirname, "..");
const SIBLING = resolve(ROOT, "..", "automatyzacja, seo, audyt");
const SHARED = ["src/lib/audit", "tests/audit"];

test("audit modules match the audyt.sobiecki.org copy byte for byte", { skip: !existsSync(SIBLING) }, () => {
  for (const dir of SHARED) {
    const here = readdirSync(resolve(ROOT, dir)).sort();
    assert.deepEqual(readdirSync(resolve(SIBLING, dir)).sort(), here, dir);
    for (const file of here) {
      const ours = readFileSync(resolve(ROOT, dir, file), "utf8");
      const theirs = readFileSync(resolve(SIBLING, dir, file), "utf8");
      assert.equal(theirs, ours, `${dir}/${file}`);
    }
  }
});
