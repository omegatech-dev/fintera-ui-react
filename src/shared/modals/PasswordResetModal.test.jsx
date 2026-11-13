import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import PasswordResetModal from "./PasswordResetModal";
import { usersApi } from "../../features/users/api";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../../contexts/LocaleContext", () => ({
  useLocale: () => ({ locale: "es", t: (key) => key }),
}));

vi.mock("../../features/users/api", () => ({
  usersApi: {
    sendRecoveryCode: vi.fn(),
    verifyRecoveryCode: vi.fn(),
    updatePasswordWithCode: vi.fn(),
  },
}));

function renderModal() {
  return render(
    <MemoryRouter initialEntries={["/signin"]}>
      <PasswordResetModal isActive handleActive={() => {}} />
    </MemoryRouter>
  );
}

async function goToVerifyStep() {
  fireEvent.change(screen.getByLabelText("auth.email"), {
    target: { value: "user@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: "common.continue" }));
  await screen.findByRole("heading", { name: "auth.enterVerificationCode" });
}

async function goToNewPasswordStep() {
  await goToVerifyStep();

  for (let index = 0; index < 6; index += 1) {
    fireEvent.change(
      screen.getByLabelText(`auth.verificationDigit ${index + 1}`),
      { target: { value: String(index + 1) } }
    );
  }

  fireEvent.click(screen.getByRole("button", { name: "auth.verify" }));
  await screen.findByRole("heading", { name: "auth.createNewPassword" });
}

beforeEach(() => {
  vi.clearAllMocks();
  usersApi.sendRecoveryCode.mockResolvedValue({});
  usersApi.verifyRecoveryCode.mockResolvedValue({ valid: true });
  usersApi.updatePasswordWithCode.mockResolvedValue({});
});

describe("PasswordResetModal", () => {
  it("runs the code flow and keeps the labels translated", async () => {
    renderModal();

    expect(
      screen.getByRole("dialog", { name: "auth.resetPassword" })
    ).toBeInTheDocument();

    await goToNewPasswordStep();

    expect(usersApi.sendRecoveryCode).toHaveBeenCalledWith("user@example.com");
    expect(usersApi.verifyRecoveryCode).toHaveBeenCalledWith(
      "user@example.com",
      "123456"
    );

    const password = screen.getByLabelText("auth.password");
    expect(password).toHaveAttribute("type", "password");

    fireEvent.click(
      screen.getAllByRole("button", { name: "auth.showPassword" })[0]
    );
    expect(password).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "auth.hidePassword" })
    ).toBeInTheDocument();

    fireEvent.change(password, { target: { value: "Abcdefg1" } });
    fireEvent.change(screen.getByLabelText("auth.confirmPassword"), {
      target: { value: "Abcdefg1" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "auth.confirmPassword" })
    );

    await screen.findByRole("heading", {
      name: "auth.passwordUpdatedSuccessfully",
    });

    expect(usersApi.updatePasswordWithCode).toHaveBeenCalledWith({
      email: "user@example.com",
      code: "123456",
      new_password: "Abcdefg1",
      new_password_confirmation: "Abcdefg1",
    });
  });

  it("uses a translated message when resending the code fails", async () => {
    renderModal();
    await goToVerifyStep();

    usersApi.sendRecoveryCode.mockRejectedValueOnce(new Error("network"));
    fireEvent.click(screen.getByRole("button", { name: "auth.resendCode" }));

    expect(await screen.findByText("auth.resendCodeError")).toBeInTheDocument();
    expect(screen.queryByText("Failed to resend code")).not.toBeInTheDocument();
  });

  it("validates that the new passwords match", async () => {
    renderModal();
    await goToNewPasswordStep();

    fireEvent.change(screen.getByLabelText("auth.password"), {
      target: { value: "Abcdefg1" },
    });
    fireEvent.change(screen.getByLabelText("auth.confirmPassword"), {
      target: { value: "Abcdefg2" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "auth.confirmPassword" })
    );

    expect(
      await screen.findByText("auth.passwordsDoNotMatch")
    ).toBeInTheDocument();
    expect(usersApi.updatePasswordWithCode).not.toHaveBeenCalled();
  });
});
