import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "../../lib/apiClient";
import { brandingApi } from "./api";

vi.mock("../../lib/apiClient", () => ({
  apiClient: { get: vi.fn(), put: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("brandingApi", () => {
  it("revalidates the branding GET so a fresh upload is visible", async () => {
    apiClient.get.mockResolvedValueOnce({ branding: { app_name: "Fintera" } });

    await brandingApi.get();

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/branding", {
      cache: "no-cache",
    });
  });

  it("sends the application name as a nested branding payload", async () => {
    apiClient.put.mockResolvedValueOnce({});

    await brandingApi.update("Acme");

    expect(apiClient.put).toHaveBeenCalledWith("/api/v1/branding", {
      branding: { app_name: "Acme" },
    });
  });

  it("uploads a logo as multipart form data with its variant", async () => {
    apiClient.post.mockResolvedValueOnce({});
    const file = new File(["x"], "logo.png", { type: "image/png" });

    await brandingApi.uploadLogo(file, "dark");

    const [endpoint, formData] = apiClient.post.mock.calls[0];
    expect(endpoint).toBe("/api/v1/branding/logo");
    expect(formData.get("logo")).toBe(file);
    expect(formData.get("variant")).toBe("dark");
  });

  it("deletes the requested variant", async () => {
    apiClient.delete.mockResolvedValueOnce({});

    await brandingApi.deleteLogo("dark");

    expect(apiClient.delete).toHaveBeenCalledWith(
      "/api/v1/branding/logo?variant=dark"
    );
  });
});
