import test from "node:test";
import assert from "node:assert/strict";
import { localizedHref, stripLocale } from "../lib/site-routing.ts";
import { validateContact } from "../lib/contact-validation.ts";
test("locale links preserve article language and query/hash, and leave external/admin links intact", () => {
  assert.equal(
    localizedHref("/services/demand-forecasting?intent=problem#scope", "ca"),
    "/ca/services/demand-forecasting?intent=problem#scope",
  );
  assert.equal(localizedHref("/en/contact", "es"), "/es/contact");
  assert.equal(
    localizedHref("/knowledge/example/es", "ca"),
    "/knowledge/example/es",
  );
  assert.equal(
    localizedHref("/knowledge/example", "ca"),
    "/knowledge/example/ca",
  );
  for (const href of [
    "https://calendly.com/example",
    "//example.org",
    "/api/contact",
    "/growth-admin",
  ])
    assert.equal(localizedHref(href, "es"), href);
  assert.equal(stripLocale("/es"), "/");
  assert.equal(stripLocale("/es/projects/x"), "/projects/x");
});
const valid = {
  name: "Test User",
  email: "test@example.org",
  message: "A business question",
  language: "ca",
};
test("contact rejects malformed types, header injection and oversized messages before persistence", () => {
  for (const body of [
    null,
    [],
    { ...valid, name: 12 },
    { ...valid, email: {} },
    { ...valid, company: [] },
    { ...valid, name: "A\r\nB" },
    { ...valid, message: "a".repeat(10001) },
    { ...valid, email: "invalid" },
    { ...valid, requestId: "invalid" },
  ])
    assert.ok("error" in validateContact(body));
});
test("contact minimizes attribution and validates stable idempotency identifiers", () => {
  const result = validateContact({
    ...valid,
    sourcePath: "/es/contact?email=private@example.org#data",
    requestId: "30c25f8a-f331-4453-a10a-4dbe9b72c12f",
  });
  assert.equal(result.data.sourcePath, "/es/contact");
  assert.equal(result.data.language, "ca");
  assert.equal(
    validateContact({ ...valid, sourcePath: "https://external.test/" }).data
      .sourcePath,
    "/contact",
  );
});
