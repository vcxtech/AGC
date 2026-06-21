import { describe, expect, it } from "vitest";
import {
  isRichTextHtml,
  plainTextToHtml,
  resolveRichHtml,
  richTextFieldInitial,
  richTextToPlain,
} from "@/lib/rich-text";

describe("rich-text helpers", () => {
  it("detects HTML vs plain text", () => {
    expect(isRichTextHtml("<p>Hello</p>")).toBe(true);
    expect(isRichTextHtml("Plain paragraph")).toBe(false);
  });

  it("wraps plain text as HTML", () => {
    expect(plainTextToHtml("Hello world")).toContain("<p>Hello world</p>");
    expect(plainTextToHtml("<p>Already</p>")).toBe("<p>Already</p>");
  });

  it("strips HTML for meta descriptions", () => {
    expect(richTextToPlain("<p>Hello <strong>AGC</strong></p>", 20)).toBe("Hello AGC");
  });

  it("prefers html over legacy paragraphs", () => {
    expect(
      resolveRichHtml({
        html: "<p>Rich</p>",
        paragraphs: ["Legacy"],
      }),
    ).toBe("<p>Rich</p>");
  });

  it("builds editor initial from paragraphs when body empty", () => {
    expect(richTextFieldInitial("", ["First", "Second"])).toBe("First\n\nSecond");
  });
});
