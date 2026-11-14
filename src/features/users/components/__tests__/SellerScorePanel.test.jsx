import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../../../locales/en.json";
import SellerScorePanel from "../SellerScorePanel";
import { sellerApi } from "@/features/seller/api";

expect.extend(matchers);
afterEach(cleanup);

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

vi.mock("@/features/seller/api", () => ({
  sellerApi: { overrideScore: vi.fn() },
}));

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "en" }),
}));

describe("SellerScorePanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sellerApi.overrideScore.mockResolvedValue({ user: { score: 84 } });
  });

  it("shows the current value and the derived level", () => {
    render(<SellerScorePanel user={{ id: 7, score: 92 }} canEdit />);

    expect(screen.getByText("Acceptance score")).toBeInTheDocument();
    expect(screen.getByLabelText("Score value")).toHaveValue(92);
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("Admins only")).toBeInTheDocument();
  });

  it("sends the override with the reason and follows the new colour", async () => {
    const onUpdated = vi.fn();
    render(
      <SellerScorePanel
        user={{ id: 7, score: 92 }}
        canEdit
        onUpdated={onUpdated}
      />
    );

    fireEvent.change(screen.getByLabelText("Score value"), {
      target: { value: "84" },
    });
    fireEvent.change(screen.getByLabelText("Override reason"), {
      target: { value: "Reviewed with the seller" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply override" }));

    await waitFor(() =>
      expect(sellerApi.overrideScore).toHaveBeenCalledWith(7, {
        score: 84,
        reason: "Reviewed with the seller",
      })
    );
    expect(await screen.findByText("Score updated.")).toBeInTheDocument();
    expect(screen.getByText("84%")).toBeInTheDocument();
    expect(onUpdated).toHaveBeenCalledWith(84);
  });

  it("requires a reason before overriding", () => {
    render(<SellerScorePanel user={{ id: 7, score: 92 }} canEdit />);

    fireEvent.click(screen.getByRole("button", { name: "Apply override" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter the override reason."
    );
    expect(sellerApi.overrideScore).not.toHaveBeenCalled();
  });

  it("is read-only for non-admins", () => {
    render(<SellerScorePanel user={{ id: 7, score: 59 }} />);

    expect(screen.getByLabelText("Score value")).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Apply override" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("59%")).toBeInTheDocument();
  });

  it("labels a seller without history as new", () => {
    render(<SellerScorePanel user={{ id: 7 }} canEdit />);

    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByLabelText("Score value")).toHaveValue(100);
  });
});
