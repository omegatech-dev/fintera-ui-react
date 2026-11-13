import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import CommissionRulesSheet from "../CommissionRulesSheet";
import { sellerApi } from "@/features/seller/api";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("@/features/seller/api", () => ({
  sellerApi: {
    getCommissionRules: vi.fn(),
    listCommissionExceptions: vi.fn(),
    listSellers: vi.fn(),
    updateCommissionRules: vi.fn(),
    upsertCommissionException: vi.fn(),
    deleteCommissionException: vi.fn(),
  },
}));

vi.mock("@/contexts/LocaleContext", () => {
  const t = (key) => key;
  return { useLocale: () => ({ t }) };
});

const renderSheet = (onSaved = vi.fn()) =>
  render(
    <CommissionRulesSheet
      open
      sellers={["Cristofer Hernandez", "Juan Perez"]}
      onClose={() => {}}
      onSaved={onSaved}
    />
  );

describe("CommissionRulesSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sellerApi.getCommissionRules.mockResolvedValue({
      rules: {
        default_rate: 5,
        payment_rule: "contract_approval",
        acceptance_window_hours: 2,
        unassigned_rate: 3,
      },
    });
    sellerApi.listCommissionExceptions.mockResolvedValue({
      exceptions: [
        { id: 1, seller_id: 11, seller_name: "Cristofer Hernandez", rate: 6 },
      ],
    });
    sellerApi.listSellers.mockResolvedValue({
      sellers: [
        { id: 11, full_name: "Cristofer Hernandez" },
        { id: 12, full_name: "Juan Perez" },
      ],
    });
    sellerApi.updateCommissionRules.mockResolvedValue({});
    sellerApi.upsertCommissionException.mockResolvedValue({});
    sellerApi.deleteCommissionException.mockResolvedValue({});
  });

  it("loads the default rate, acceptance window and exceptions", async () => {
    renderSheet();

    expect(
      await screen.findByLabelText("commissions.defaultRate")
    ).toHaveValue(5);
    expect(screen.getByLabelText("commissions.acceptanceWindow")).toHaveValue(
      2
    );
    expect(
      screen.getByText("commissions.acceptanceWindowHint")
    ).toBeInTheDocument();
    expect(screen.getByText("Cristofer Hernandez")).toBeInTheDocument();
    expect(screen.getByText("Juan Perez")).toBeInTheDocument();
    expect(
      screen.getByText("commissions.unassignedRate")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Cristofer Hernandez commissions.rate")
    ).toHaveValue(6);
    expect(screen.getByLabelText("Juan Perez commissions.rate")).toHaveValue(5);
    expect(
      screen.getByLabelText("commissions.unassignedRate")
    ).toHaveValue(3);
    expect(
      screen.getByRole("combobox")
    ).toHaveValue("contract_approval");
  });

  it("saves the global rules and the per-seller exceptions", async () => {
    const onSaved = vi.fn();
    renderSheet(onSaved);

    await screen.findByLabelText("commissions.defaultRate");
    fireEvent.change(screen.getByLabelText("commissions.defaultRate"), {
      target: { value: "5.5" },
    });
    fireEvent.change(screen.getByLabelText("commissions.acceptanceWindow"), {
      target: { value: "3" },
    });
    fireEvent.change(
      screen.getByLabelText("Cristofer Hernandez commissions.rate"),
      { target: { value: "6.5" } }
    );
    fireEvent.change(screen.getByLabelText("Juan Perez commissions.rate"), {
      target: { value: "7" },
    });
    fireEvent.change(screen.getByLabelText("commissions.unassignedRate"), {
      target: { value: "4" },
    });

    fireEvent.submit(document.getElementById("commission-rules-form"));

    await waitFor(() =>
      expect(sellerApi.updateCommissionRules).toHaveBeenCalledWith({
        default_rate: 5.5,
        payment_rule: "contract_approval",
        acceptance_window_hours: 3,
        unassigned_rate: 4,
      })
    );
    await waitFor(() =>
      expect(sellerApi.upsertCommissionException).toHaveBeenCalledTimes(2)
    );
    expect(sellerApi.upsertCommissionException).toHaveBeenCalledWith({
      seller_id: 11,
      rate: 6.5,
    });
    expect(sellerApi.upsertCommissionException).toHaveBeenCalledWith({
      seller_id: 12,
      rate: 7,
    });
    expect(onSaved).toHaveBeenCalled();
  });

  it("removes an exception when its rate matches the default", async () => {
    renderSheet();

    await screen.findByLabelText("Cristofer Hernandez commissions.rate");
    fireEvent.change(
      screen.getByLabelText("Cristofer Hernandez commissions.rate"),
      { target: { value: "5" } }
    );
    fireEvent.submit(document.getElementById("commission-rules-form"));

    await waitFor(() =>
      expect(sellerApi.deleteCommissionException).toHaveBeenCalledWith(1)
    );
    expect(sellerApi.upsertCommissionException).not.toHaveBeenCalled();
  });

  it("rejects an invalid acceptance window", async () => {
    renderSheet();

    await screen.findByLabelText("commissions.acceptanceWindow");
    fireEvent.change(screen.getByLabelText("commissions.acceptanceWindow"), {
      target: { value: "0" },
    });
    fireEvent.submit(document.getElementById("commission-rules-form"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "commissions.rulesInvalid"
    );
    expect(sellerApi.updateCommissionRules).not.toHaveBeenCalled();
  });
});
