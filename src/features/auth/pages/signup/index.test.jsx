import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import SignUp from "./index";

expect.extend(matchers);
afterEach(cleanup);

function renderSignup() {
  return render(
    <MemoryRouter initialEntries={["/signup"]}>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<div>sign in page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("SignUp route", () => {
  it("redirects to sign in instead of rendering a public registration form", () => {
    renderSignup();

    expect(screen.getByText("sign in page")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
