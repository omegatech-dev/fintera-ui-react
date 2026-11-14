import { describe, expect, it, vi } from "vitest";
import {
  displayReferralUrl,
  referralCode,
  referralUrl,
} from "./referral";

vi.mock("@config", () => ({
  CUSTOMER_PORTAL_URL: "https://portal.test/",
}));

const GUID = "9f2c1e6a-7b3d-4c58-9a10-2d5e8f4b6c71";

describe("referralUrl", () => {
  it("builds the public link from the portal URL and the seller GUID", () => {
    expect(referralUrl({ referral_guid: GUID })).toBe(
      `https://portal.test/r/${GUID}`
    );
  });

  it("prioritizes the GUID over the legacy slug", () => {
    expect(
      referralUrl({ referral_guid: GUID, slug: "cristofer-m" })
    ).toBe(`https://portal.test/r/${GUID}`);
  });

  it("falls back to a slug while the API has not migrated", () => {
    expect(referralUrl({ slug: "cristofer-m" })).toBe(
      "https://portal.test/r/cristofer-m"
    );
    expect(referralUrl({ referral_slug: "cristofer-m" })).toBe(
      "https://portal.test/r/cristofer-m"
    );
  });

  it("normalizes duplicate slashes", () => {
    expect(referralUrl({ guid: `/${GUID}` })).toBe(
      `https://portal.test/r/${GUID}`
    );
    expect(referralUrl({ guid: `//${GUID}` })).toBe(
      `https://portal.test/r/${GUID}`
    );
  });

  it("uses an explicit URL when no seller identifier is available", () => {
    expect(referralUrl({ url: "portal.test/r/legacy/" })).toBe(
      "https://portal.test/r/legacy"
    );
  });

  it("returns an empty string without link data", () => {
    expect(referralUrl(null)).toBe("");
    expect(referralUrl({})).toBe("");
  });

  it("exposes the referral code used for file names", () => {
    expect(referralCode({ referral_guid: GUID, slug: "cristofer-m" })).toBe(
      GUID
    );
    expect(referralCode({ slug: "cristofer-m" })).toBe("cristofer-m");
  });

  it("hides the protocol in the display URL", () => {
    expect(
      displayReferralUrl(referralUrl({ referral_guid: GUID }))
    ).toBe(`portal.test/r/${GUID}`);
  });
});
