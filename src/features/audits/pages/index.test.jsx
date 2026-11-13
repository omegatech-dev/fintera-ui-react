import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../../locales/en.json";
import Audits from "./index";
import { auditsApi } from "../api";

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

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "en" }),
}));

vi.mock("../api", () => ({
  auditsApi: { list: vi.fn() },
}));

const audits = [
  {
    id: 1,
    action: "update",
    entity: "Lot",
    entity_id: 20,
    user: { full_name: "Ana Admin" },
    created_at: "2026-11-10T12:17:00Z",
    parsed_changes: { status: "active" },
    ip_address: "10.0.0.1",
    user_agent: "Firefox",
  },
  {
    id: 2,
    action: "approve",
    entity: "Payment",
    entity_id: 191,
    user: { full_name: "Milton Perez" },
    created_at: "2026-11-10T12:48:00Z",
  },
  {
    id: 3,
    action: "cancel",
    entity: "Contract",
    entity_id: 13,
    user: { full_name: "Sergio Peralta" },
    created_at: "2026-11-09T12:09:00Z",
  },
];

const listResponse = {
  audits,
  pagination: { total: 3 },
};

describe("audits page", () => {
  beforeEach(() => {
    auditsApi.list.mockReset();
    auditsApi.list.mockResolvedValue(listResponse);
  });

  afterEach(cleanup);

  it("renders the header, real total and grouped timeline", async () => {
    const { container } = render(<Audits />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Audits" })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("System change log · 3 events")
    ).toBeInTheDocument();

    expect(await screen.findByText("Ana Admin")).toBeInTheDocument();
    expect(screen.getByText("Milton Perez")).toBeInTheDocument();
    expect(screen.getByText("Sergio Peralta")).toBeInTheDocument();

    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings).toHaveLength(2);

    const sections = container.querySelectorAll("section[aria-labelledby]");
    expect(sections).toHaveLength(2);
    expect(sections[0].querySelectorAll("li")).toHaveLength(2);
    expect(sections[1].querySelectorAll("li")).toHaveLength(1);
  });

  it("filters the visible events by action", async () => {
    render(<Audits />);

    await screen.findByText("Ana Admin");

    fireEvent.change(screen.getByLabelText("Filter by action"), {
      target: { value: "update" },
    });

    expect(screen.getByText("Ana Admin")).toBeInTheDocument();
    expect(screen.queryByText("Milton Perez")).not.toBeInTheDocument();
    expect(screen.queryByText("Sergio Peralta")).not.toBeInTheDocument();
  });

  it("requests the API with the selected model", async () => {
    render(<Audits />);
    await screen.findByText("Ana Admin");

    fireEvent.change(screen.getByLabelText(/Filter by model/i), {
      target: { value: "Contract" },
    });

    await waitFor(() =>
      expect(auditsApi.list).toHaveBeenLastCalledWith(
        expect.objectContaining({ model: "Contract", page: 1 })
      )
    );
  });

  it("requests the API with the debounced search term", async () => {
    render(<Audits />);
    await screen.findByText("Ana Admin");

    fireEvent.change(screen.getByLabelText("Search user or record"), {
      target: { value: "milton" },
    });

    await waitFor(
      () =>
        expect(auditsApi.list).toHaveBeenLastCalledWith(
          expect.objectContaining({ search_term: "milton" })
        ),
      { timeout: 2000 }
    );
  });

  it("shows the empty state when there are no audits", async () => {
    auditsApi.list.mockResolvedValue({ audits: [], pagination: { total: 0 } });

    render(<Audits />);

    expect(
      await screen.findByText("No audit logs found")
    ).toBeInTheDocument();
  });

  it("shows an error state and retries", async () => {
    auditsApi.list.mockRejectedValueOnce(new Error("boom"));

    render(<Audits />);

    expect(await screen.findByText("boom")).toBeInTheDocument();
    auditsApi.list.mockResolvedValue(listResponse);
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("Ana Admin")).toBeInTheDocument();
    expect(auditsApi.list).toHaveBeenCalledTimes(2);
  });

  it("expands an event to show changed fields", async () => {
    render(<Audits />);
    await screen.findByText("Ana Admin");

    fireEvent.click(screen.getByRole("button", { name: "Show details" }));

    expect(screen.getByText("status")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText(/10.0.0.1/)).toBeInTheDocument();
  });
});
