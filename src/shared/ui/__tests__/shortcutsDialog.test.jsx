import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import ShortcutsDialog from "../ShortcutsDialog";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../../../contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "en" }),
}));

const shortcuts = [
  { keys: ["g", "d"], labelKey: "dashboard.dashboard", to: "/" },
  { keys: ["g", "p"], labelKey: "dashboard.payments", to: "/payments" },
  { keys: ["n", "r"], labelKey: "shortcuts.newReservation", to: "/projects" },
  {
    keys: ["n", "c"],
    labelKey: "shortcuts.newClient",
    to: "/vendedor/clientes/historicos",
  },
];

describe("ShortcutsDialog", () => {
  it("groups navigation and create chords for the active role", () => {
    render(<ShortcutsDialog open shortcuts={shortcuts} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "shortcuts.title" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "shortcuts.navigateGroup" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "shortcuts.createGroup" })
    ).toBeInTheDocument();

    const [navigation, actions] = screen.getAllByRole("table");
    expect(within(navigation).getByText("dashboard.dashboard")).toBeInTheDocument();
    expect(within(navigation).getByText("dashboard.payments")).toBeInTheDocument();
    expect(within(navigation).getAllByText("g")).toHaveLength(2);
    expect(within(actions).getByText("shortcuts.newReservation")).toBeInTheDocument();
    expect(within(actions).getByText("shortcuts.newClient")).toBeInTheDocument();
    expect(within(actions).getAllByText("n")).toHaveLength(2);
  });

  it("closes with Escape", () => {
    const onClose = vi.fn();
    render(<ShortcutsDialog open shortcuts={shortcuts} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes from the footer action", () => {
    const onClose = vi.fn();
    render(<ShortcutsDialog open shortcuts={shortcuts} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "shortcuts.close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders nothing while closed", () => {
    render(<ShortcutsDialog open={false} shortcuts={shortcuts} onClose={() => {}} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
