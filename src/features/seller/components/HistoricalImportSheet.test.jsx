import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../../locales/en.json";
import HistoricalImportSheet from "./HistoricalImportSheet";

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

vi.mock("../api", () => ({
  sellerApi: { importHistoricalSales: vi.fn() },
}));

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "en" }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast }),
}));

import { sellerApi } from "../api";

const CSV = [
  "nombre,identidad,proyecto,precio,fecha_venta",
  "Ana Ramos,0801-1990-00001,Los Pinos,750000,2023-05-15",
  "Luis Perez,0801-1990-00002,Los Pinos,abc,2023-06-01",
].join("\n");

const uploadCsv = () => {
  const file = new File([CSV], "historico.csv", { type: "text/csv" });
  fireEvent.change(screen.getByLabelText(/Drag the CSV file here/), {
    target: { files: [file] },
  });
  return file;
};

function renderSheet(overrides = {}) {
  return render(
    <HistoricalImportSheet
      open
      onClose={vi.fn()}
      onImported={vi.fn()}
      {...overrides}
    />
  );
}

beforeEach(() => {
  sellerApi.importHistoricalSales.mockReset();
  sellerApi.importHistoricalSales.mockResolvedValue({ imported: 1 });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("historical CSV import sheet", () => {
  it("previews the mapping, options and valid/error summary", async () => {
    renderSheet();

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Import historical clients (CSV)",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("Download template")).toBeInTheDocument();

    expect(
      screen.getByRole("switch", { name: "Mark all as historical" })
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("switch", { name: "Skip duplicates by identity" })
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("switch", {
        name: "Create the commission with the sale date",
      })
    ).toHaveAttribute("aria-checked", "true");

    uploadCsv();

    expect(await screen.findByText(/1 clients will be imported/)).toBeInTheDocument();
    expect(
      screen.getByText(/1 rows with errors will be skipped/)
    ).toBeInTheDocument();

    const nameMapping = screen.getByLabelText("COLUMN MAPPING Full name");
    const identityMapping = screen.getByLabelText("COLUMN MAPPING Identity");
    expect(nameMapping).toHaveValue("0");
    expect(identityMapping).toHaveValue("1");

    fireEvent.click(
      screen.getByRole("button", { name: /View the 1 rows with errors/ })
    );
    expect(screen.getByText(/Row 3: Invalid price/)).toBeInTheDocument();
  });

  it("recalculates the summary when a column mapping changes", async () => {
    renderSheet();
    uploadCsv();

    await screen.findByText(/1 clients will be imported/);

    fireEvent.change(screen.getByLabelText("COLUMN MAPPING Full name"), {
      target: { value: "" },
    });

    expect(
      await screen.findByText(/0 clients will be imported/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/2 rows with errors will be skipped/)
    ).toBeInTheDocument();
  });

  it("sends the selected toggles and mapping with the import", async () => {
    const onClose = vi.fn();
    const onImported = vi.fn();
    renderSheet({ onClose, onImported });

    const file = uploadCsv();
    await screen.findByText(/1 clients will be imported/);

    fireEvent.click(
      screen.getByRole("switch", { name: "Skip duplicates by identity" })
    );

    fireEvent.click(screen.getByRole("button", { name: "Import clients" }));

    await waitFor(() =>
      expect(sellerApi.importHistoricalSales).toHaveBeenCalledTimes(1)
    );

    const [sentFile, options] = sellerApi.importHistoricalSales.mock.calls[0];
    expect(sentFile).toBe(file);
    expect(options).toMatchObject({
      mark_historical: true,
      skip_duplicates: false,
      create_commission: true,
    });
    expect(JSON.parse(options.mapping)).toEqual({
      full_name: "0",
      identity: "1",
      project_name: "2",
      sale_price: "3",
      sale_date: "4",
    });

    expect(onImported).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledWith(
      "1 historical clients imported.",
      "success"
    );
  });

  it("keeps the sheet open and reports an import error", async () => {
    sellerApi.importHistoricalSales.mockRejectedValueOnce(
      new Error("Import failed")
    );
    const onClose = vi.fn();
    renderSheet({ onClose });

    uploadCsv();
    await screen.findByText(/1 clients will be imported/);
    fireEvent.click(screen.getByRole("button", { name: "Import clients" }));

    expect(await screen.findByText("Import failed")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("reports a partial import with skipped rows and server errors", async () => {
    sellerApi.importHistoricalSales.mockResolvedValueOnce({
      imported: 1,
      skipped: 1,
      skipped_rows: [{ row: 2, reason: "duplicate" }],
      errors: [{ row: 3, reason: "Invalid price" }],
    });
    const onClose = vi.fn();
    const onImported = vi.fn();
    renderSheet({ onClose, onImported });

    uploadCsv();
    await screen.findByText(/1 clients will be imported/);
    fireEvent.click(screen.getByRole("button", { name: "Import clients" }));

    expect(
      await screen.findByText(/Imported 1\. Skipped: 2\. Errors: 1\./)
    ).toBeInTheDocument();
    expect(showToast).toHaveBeenCalledWith(
      "1 historical clients imported.",
      "warning"
    );
    expect(onImported).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
