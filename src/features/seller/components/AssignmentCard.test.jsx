import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../../locales/en.json";
import AssignmentCard from "./AssignmentCard";
import { sellerApi } from "../api";

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
  sellerApi: {
    acceptAssignment: vi.fn(),
  },
}));

const pending = {
  id: 4,
  status: "pending",
  accept_deadline_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  lot_name: "Lote 5",
  project_name: "Condominios Omega",
  amount: 300000,
  commission_amount: 15000,
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

beforeEach(() => {
  sellerApi.acceptAssignment.mockResolvedValue({ status: "accepted" });
});

describe("AssignmentCard", () => {
  it("shows the pending countdown and the expiry warning", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-13T10:00:00Z"));

    render(
      <AssignmentCard
        assignment={{
          ...pending,
          accept_deadline_at: "2026-11-13T11:59:12Z",
        }}
        onAccept={vi.fn()}
      />
    );

    expect(screen.getByText("PENDING ACCEPTANCE")).toBeInTheDocument();
    expect(screen.getByText("New reservation assigned")).toBeInTheDocument();
    expect(screen.getByText("01:59:12")).toBeInTheDocument();
    expect(
      screen.getByText(
        "If you don't accept, the assignment expires and you lose the commission."
      )
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("01:59:11")).toBeInTheDocument();
  });

  it("accepts the assignment and shows the estimated commission", async () => {
    render(<AssignmentCard assignment={pending} />);

    fireEvent.click(screen.getByRole("button", { name: "Accept" }));

    expect(await screen.findByText("ESTIMATED COMMISSION")).toBeInTheDocument();
    expect(screen.getByText("L 15,000")).toBeInTheDocument();
    expect(
      screen.getByText("You can now follow up with the client from My clients.")
    ).toBeInTheDocument();
    expect(sellerApi.acceptAssignment).toHaveBeenCalledWith(4);
  });

  it("renders the expired state without actions", () => {
    render(
      <AssignmentCard
        assignment={{ ...pending, status: "expired", accept_deadline_at: null }}
      />
    );

    expect(screen.getByText("EXPIRED")).toBeInTheDocument();
    expect(screen.getByText("Assignment expired")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Accept" })).toBeNull();
  });

  it("surfaces an accept error without dropping the pending state", async () => {
    sellerApi.acceptAssignment.mockRejectedValueOnce(new Error("boom"));

    render(<AssignmentCard assignment={pending} />);

    fireEvent.click(screen.getByRole("button", { name: "Accept" }));

    expect(
      await screen.findByText("We couldn't accept the assignment.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
    expect(screen.getByText("TIME TO ACCEPT")).toBeInTheDocument();
  });
});
