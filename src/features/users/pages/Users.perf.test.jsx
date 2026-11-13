import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { MemoryRouter } from "react-router-dom";

import Users from "./index";
import AuthContext from "../../../contexts/AuthContext";
import { usersApi } from "../api";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../api", () => ({
  usersApi: {
    list: vi.fn(),
    toggleStatus: vi.fn(),
    resendConfirmation: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../../contexts/LocaleContext", () => {
  const t = (key) => key;
  return { useLocale: () => ({ t, locale: "es" }) };
});

vi.mock("../../../contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("../components/RightSidebar", () => ({
  default: ({ user }) => <div>drawer:{user.full_name}</div>,
}));

const USERS = [
  {
    id: 1,
    full_name: "Ana Admin",
    email: "ana@example.com",
    role: "admin",
    status: "active",
    clients_count: 3,
    last_sign_in_at: "2026-01-02T10:00:00Z",
  },
  {
    id: 2,
    full_name: "Vic Vendedor",
    email: "vic@example.com",
    role: "seller",
    status: "inactive",
  },
  {
    id: 3,
    full_name: "Carla Cliente",
    email: "carla@example.com",
    role: "user",
    status: "active",
    client_count: 0,
  },
];

const renderUsers = () =>
  render(
    <MemoryRouter initialEntries={["/users"]}>
      <AuthContext.Provider value={{ user: { id: 99, role: "admin" } }}>
        <Users />
      </AuthContext.Provider>
    </MemoryRouter>
  );

const mainListCalls = () =>
  usersApi.list.mock.calls.filter(([params]) => params?.per_page !== 1);

describe("Users page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersApi.list.mockImplementation((params = {}) => {
      if (params.per_page === 1) {
        const totals = { admin: 1, seller: 1, user: 1 };
        return Promise.resolve({
          pagination: { total: params.role ? totals[params.role] : 3 },
        });
      }
      return Promise.resolve({
        users: USERS,
        pagination: { total: USERS.length, pages: 1 },
      });
    });
  });

  it("renders the user table and opens the detail drawer on row click", async () => {
    renderUsers();

    expect((await screen.findAllByText("Ana Admin"))[0]).toBeInTheDocument();
    expect(screen.getAllByText("ana@example.com")[0]).toBeInTheDocument();
    expect(screen.getAllByText(/users\.lastAccess/)[0]).toBeInTheDocument();

    fireEvent.click(screen.getAllByText("Ana Admin")[0]);

    expect(await screen.findByText("drawer:Ana Admin")).toBeInTheDocument();
  });

  it("does not refetch the list when the drawer opens", async () => {
    renderUsers();

    await screen.findAllByText("Ana Admin");
    const callsBefore = mainListCalls().length;

    fireEvent.click(screen.getAllByText("Vic Vendedor")[0]);
    await screen.findByText("drawer:Vic Vendedor");

    expect(mainListCalls()).toHaveLength(callsBefore);
  });

  it("filters by role chip", async () => {
    renderUsers();
    await screen.findAllByText("Ana Admin");

    fireEvent.click(
      screen.getByRole("button", { name: /users\.filterSellers/ })
    );

    await waitFor(() =>
      expect(usersApi.list).toHaveBeenCalledWith(
        expect.objectContaining({ role: "seller", page: 1 })
      )
    );
  });

  it("searches after three characters", async () => {
    renderUsers();
    await screen.findAllByText("Ana Admin");

    fireEvent.change(
      screen.getByPlaceholderText("userFilter.searchPlaceholder"),
      { target: { value: "carla" } }
    );

    await waitFor(
      () =>
        expect(usersApi.list).toHaveBeenCalledWith(
          expect.objectContaining({ search_term: "carla", page: 1 })
        ),
      { timeout: 2500 }
    );
  });
});
