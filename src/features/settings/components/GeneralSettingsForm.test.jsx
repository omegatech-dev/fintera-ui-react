// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import GeneralSettingsForm from "./GeneralSettingsForm";
import { settingsApi } from "../api";

expect.extend(matchers);

const showToast = vi.fn();

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({
    t: (key) =>
      ({
        "branding.supportWhatsApp": "WhatsApp de soporte",
        "branding.supportEmail": "Correo de soporte",
        "branding.holdHours": "Bloqueo de reserva (horas)",
        "branding.save": "Guardar cambios",
        "branding.saving": "Guardando...",
        "branding.generalSaved": "Configuración general actualizada",
        "branding.errorWhatsApp": "WhatsApp inválido",
        "branding.errorEmail": "Correo inválido",
        "branding.errorHoldHours": "Bloqueo inválido",
        "common.loading": "Cargando...",
      }[key] || key),
  }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast }),
}));

vi.mock("../api", () => ({
  settingsApi: { get: vi.fn(), update: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
  settingsApi.get.mockResolvedValue({
    settings: {
      support_whatsapp: "+50499998888",
      support_email: "soporte@fintera.test",
      reservation_hold_hours: 48,
    },
  });
});

afterEach(() => {
  cleanup();
});

describe("GeneralSettingsForm", () => {
  it("loads and saves the support settings", async () => {
    settingsApi.update.mockResolvedValue({
      settings: {
        support_whatsapp: "+50488887777",
        support_email: "nuevo@fintera.test",
        reservation_hold_hours: 72,
      },
    });

    render(<GeneralSettingsForm />);

    expect(
      await screen.findByLabelText("WhatsApp de soporte")
    ).toHaveValue("+50499998888");

    fireEvent.change(screen.getByLabelText("WhatsApp de soporte"), {
      target: { value: "+50488887777" },
    });
    fireEvent.change(screen.getByLabelText("Correo de soporte"), {
      target: { value: "nuevo@fintera.test" },
    });
    fireEvent.change(screen.getByLabelText("Bloqueo de reserva (horas)"), {
      target: { value: "72" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(settingsApi.update).toHaveBeenCalledWith({
        support_whatsapp: "+50488887777",
        support_email: "nuevo@fintera.test",
        reservation_hold_hours: 72,
      });
    });
    expect(showToast).toHaveBeenCalledWith(
      "Configuración general actualizada",
      "success"
    );
  });

  it("rejects an invalid WhatsApp number", async () => {
    render(<GeneralSettingsForm />);

    fireEvent.change(await screen.findByLabelText("WhatsApp de soporte"), {
      target: { value: "abc" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(settingsApi.update).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith("WhatsApp inválido", "error");
  });
});
