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
import { commissionsApi } from "../../api";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../../api", () => ({
  commissionsApi: {
    listProjects: vi.fn(),
    getProject: vi.fn(),
    updateProject: vi.fn(),
  },
}));

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  commissionsApi.listProjects.mockResolvedValue({
    projects: [{ id: 7, name: "Altos del Valle" }],
  });
  commissionsApi.getProject.mockResolvedValue({
    project: {
      id: 7,
      guid: "project-guid",
      name: "Altos del Valle",
      commission_rate_direct: 4,
      commission_rate_bank: 6,
      commission_rate_cash: 7,
    },
  });
  commissionsApi.updateProject.mockResolvedValue({});
});

describe("CommissionRulesSheet", () => {
  it("saves the project rates and keeps unsupported rules read-only", async () => {
    const onSaved = vi.fn();

    render(
      <CommissionRulesSheet
        open
        sellers={["Ana"]}
        onClose={() => {}}
        onSaved={onSaved}
      />
    );

    expect(await screen.findByDisplayValue("4")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("projects.commissionRateDirect"), {
      target: { value: "5" },
    });
    fireEvent.submit(document.getElementById("commission-rules-form"));

    await waitFor(() =>
      expect(commissionsApi.updateProject).toHaveBeenCalledWith(
        7,
        expect.objectContaining({
          commission_rate_direct: 5,
          commission_rate_bank: 6,
          commission_rate_cash: 7,
        })
      )
    );
    expect(onSaved).toHaveBeenCalled();

    expect(
      screen.getByDisplayValue("commissions.approveTrigger")
    ).toBeDisabled();
    expect(screen.getByLabelText("Ana commissions.defaultRate")).toBeDisabled();
  });
});
