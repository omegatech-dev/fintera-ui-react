import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import EditUser from "./index";
import AuthContext from "../../../../contexts/AuthContext";
import { usersApi } from "../../api";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../../api", () => ({
  usersApi: {
    get: vi.fn(),
    update: vi.fn(),
    uploadPicture: vi.fn(),
  },
}));

vi.mock("../../../../contexts/LocaleContext", () => {
  const t = (key) => key;
  return { useLocale: () => ({ t, locale: "es" }) };
});

const renderEdit = () =>
  render(
    <AuthContext.Provider
      value={{ user: { id: 99, role: "admin", full_name: "Owner" } }}
    >
      <MemoryRouter initialEntries={["/users/7/edit"]}>
        <Routes>
          <Route path="/users/:id/edit" element={<EditUser />} />
          <Route path="/users" element={<div>users list</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe("EditUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersApi.get.mockResolvedValue({
      user: {
        id: 7,
        full_name: "Ana Admin",
        phone: "9999-9999",
        email: "ana@example.com",
        identity: "0801199012345",
        rtn: "08011990123456",
        address: "Tegucigalpa",
        role: "seller",
        creator: { full_name: "Owner" },
      },
    });
    usersApi.update.mockResolvedValue({});
    usersApi.uploadPicture.mockResolvedValue({});
  });

  it("prefills the form and saves updates without requiring a password", async () => {
    const { container } = renderEdit();

    expect(await screen.findByDisplayValue("Ana Admin")).toBeInTheDocument();
    expect(screen.getByDisplayValue("ana@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0801-1990-12345")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0801-1990-12345-6")).toBeInTheDocument();

    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => expect(usersApi.update).toHaveBeenCalled());
    expect(usersApi.update).toHaveBeenCalledWith(
      "7",
      expect.objectContaining({
        full_name: "Ana Admin",
        email: "ana@example.com",
        identity: "0801199012345",
        rtn: "08011990123456",
        role: "seller",
      })
    );
    expect(usersApi.update.mock.calls[0][1]).not.toHaveProperty("password");

    expect(await screen.findByText("users list")).toBeInTheDocument();
  });
});
