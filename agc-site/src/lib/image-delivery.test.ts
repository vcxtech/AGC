import { afterEach, describe, expect, it, vi } from "vitest";
import { preferUnoptimizedImage } from "./image-delivery";

describe("preferUnoptimizedImage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("always unoptimizes SVG", () => {
    expect(preferUnoptimizedImage("/uploads/logo.svg")).toBe(true);
    expect(preferUnoptimizedImage("https://cdn.example.com/icon.svg")).toBe(true);
  });

  it("optimizes relative uploads by default", () => {
    expect(preferUnoptimizedImage("/uploads/hero.jpg")).toBe(false);
  });

  it("honors NEXT_PUBLIC_IMAGE_UNOPTIMIZED_UPLOADS escape hatch", () => {
    vi.stubEnv("NEXT_PUBLIC_IMAGE_UNOPTIMIZED_UPLOADS", "1");
    expect(preferUnoptimizedImage("/uploads/hero.jpg")).toBe(true);
  });

  it("optimizes same-origin absolute upload URLs when site URL is set", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.example.org");
    expect(
      preferUnoptimizedImage("https://www.example.org/uploads/photo.png"),
    ).toBe(false);
  });

  it("skips optimizer for absolute upload URLs on unknown hosts", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.example.org");
    expect(
      preferUnoptimizedImage("https://staging.sslip.io/uploads/photo.png"),
    ).toBe(true);
  });
});
