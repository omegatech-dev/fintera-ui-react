import { describe, it, expect } from "vitest";
import { matchRoutes } from "react-router-dom";
import { appRoutes } from "./routes";

const matchedPaths = (url) =>
  (matchRoutes(appRoutes, url) || []).map((match) => match.route.path);

describe("router settings routes", () => {
  it("keeps personal settings separate from the admin settings hub", () => {
    expect(matchedPaths("/settings")).toContain("/settings");
    expect(matchedPaths("/settings/general")).toContain("/settings/general");
    expect(matchedPaths("/settings/branding")).toContain("/settings/branding");

    expect(matchedPaths("/settings/user/1")).toContain("/settings/user/:userId");
    expect(matchedPaths("/settings/user/1")).not.toContain("/settings/general");

    expect(matchedPaths("/settings/user/1/security")).toContain(
      "/settings/user/:userId"
    );
    expect(matchedPaths("/settings/user/1/security")).not.toContain(
      "/settings/general"
    );
  });
});
