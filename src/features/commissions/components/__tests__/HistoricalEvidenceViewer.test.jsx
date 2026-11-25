import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../../../locales/en.json";
import HistoricalEvidenceViewer from "../HistoricalEvidenceViewer";

expect.extend(matchers);

const getValue = (object, path) =>
  path.split(".").reduce((current, key) => current?.[key], object);

const t = (key, params = {}) => {
  const value = getValue(en, key) ?? key;
  return Object.entries(params).reduce(
    (text, [name, replacement]) =>
      text.replaceAll(`{${name}}`, String(replacement)),
    value
  );
};

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));

vi.mock("@/features/seller/api", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    sellerApi: {
      ...actual.sellerApi,
      fetchHistoricalEvidence: vi.fn(),
      downloadHistoricalEvidence: vi.fn(),
    },
  };
});

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "en" }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast }),
}));

import { sellerApi } from "@/features/seller/api";

let createObjectURL;
let revokeObjectURL;
let anchorClick;

beforeEach(() => {
  sellerApi.fetchHistoricalEvidence.mockReset();
  sellerApi.downloadHistoricalEvidence.mockReset();
  showToast.mockReset();

  sellerApi.fetchHistoricalEvidence.mockResolvedValue({
    kind: "file",
    url: "blob:preview",
    contentType: "image/png",
  });
  sellerApi.downloadHistoricalEvidence.mockResolvedValue(
    new Blob(["bytes"], { type: "image/png" })
  );

  createObjectURL = vi.fn(() => "blob:download");
  revokeObjectURL = vi.fn();
  vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });

  anchorClick = vi
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  anchorClick.mockRestore();
  vi.clearAllMocks();
});

const renderViewer = (evidencePath = "evidence/2026/11/a3f8.png") =>
  render(<HistoricalEvidenceViewer saleId={91} evidencePath={evidencePath} />);

const openViewer = async () => {
  renderViewer();
  fireEvent.click(screen.getByRole("button", { name: "View evidence" }));
  await waitFor(() =>
    expect(sellerApi.fetchHistoricalEvidence).toHaveBeenCalledWith(91)
  );
};

describe("HistoricalEvidenceViewer", () => {
  it("renders an inline image for a stored file", async () => {
    await openViewer();

    const image = await screen.findByRole("img");
    expect(image).toHaveAttribute("src", "blob:preview");
    expect(document.querySelector("iframe")).toBeNull();
  });

  it("renders a PDF in an iframe", async () => {
    sellerApi.fetchHistoricalEvidence.mockResolvedValue({
      kind: "file",
      url: "blob:preview",
      contentType: "application/pdf",
    });

    renderViewer("evidence/2026/11/a3f8.pdf");
    fireEvent.click(screen.getByRole("button", { name: "View evidence" }));

    await waitFor(() =>
      expect(document.querySelector("iframe")).toHaveAttribute(
        "src",
        "blob:preview"
      )
    );
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("shows the external image for legacy evidence", async () => {
    sellerApi.fetchHistoricalEvidence.mockResolvedValue({
      kind: "external",
      url: "https://cdn.example.com/old.png",
    });

    await openViewer();

    const image = await screen.findByRole("img");
    expect(image).toHaveAttribute("src", "https://cdn.example.com/old.png");
  });

  it("links to external evidence that is not an image", async () => {
    sellerApi.fetchHistoricalEvidence.mockResolvedValue({
      kind: "external",
      url: "https://cdn.example.com/old-doc",
    });

    await openViewer();

    const link = await screen.findByRole("link", {
      name: "Open external evidence",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://cdn.example.com/old-doc"
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("shows the empty state when there is no evidence", async () => {
    sellerApi.fetchHistoricalEvidence.mockResolvedValue({ kind: "none" });

    await openViewer();

    expect(await screen.findByText("No evidence")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Download" })).toBeNull();
  });

  it("shows an error with retry and recovers", async () => {
    sellerApi.fetchHistoricalEvidence
      .mockRejectedValueOnce({ message: "Boom" })
      .mockResolvedValueOnce({
        kind: "file",
        url: "blob:preview",
        contentType: "image/png",
      });

    await openViewer();

    expect(await screen.findByText("Boom")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByRole("img")).toHaveAttribute(
      "src",
      "blob:preview"
    );
    expect(sellerApi.fetchHistoricalEvidence).toHaveBeenCalledTimes(2);
  });

  it("offers a download for unexpected content types", async () => {
    sellerApi.fetchHistoricalEvidence.mockResolvedValue({
      kind: "file",
      url: "blob:preview",
      contentType: "text/plain",
    });

    await openViewer();

    expect(
      await screen.findByText(
        "This file type cannot be displayed here; download it to review it."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeEnabled();
  });

  it("downloads the evidence with a generated file name", async () => {
    await openViewer();
    fireEvent.click(await screen.findByRole("button", { name: "Download" }));

    await waitFor(() =>
      expect(sellerApi.downloadHistoricalEvidence).toHaveBeenCalledWith(91)
    );

    const anchor = anchorClick.mock.instances[0];
    expect(anchor.download).toBe("respaldo-91.png");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:download");
  });

  it("revokes the object URL when the viewer closes", async () => {
    await openViewer();
    expect(await screen.findByRole("img")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Close" })[0]);

    await waitFor(() =>
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:preview")
    );
    expect(screen.queryByRole("img")).toBeNull();
  });
});
