import { describe, it, expect } from "vitest";
import en from "../../locales/en.json";
import es from "../../locales/es.json";
import {
  AUDIT_MODELS,
  formatAuditEvent,
  formatAuditModel,
} from "./modelLabels";

const t = (key) => {
  const translations = {
    "audits.models.Lot": "Lote",
    "audits.models.GeneralSettings": "Configuración general",
    "audits.models.ProjectDrawing": "Plano del proyecto",
    "audits.events.update": "Actualizar",
  };
  return translations[key] || key;
};

describe("audit model labels", () => {
  it("includes every model exposed by the audit API", () => {
    expect(AUDIT_MODELS).toEqual(
      expect.arrayContaining([
        "Contract",
        "Lot",
        "User",
        "Project",
        "Payment",
        "ProjectPhoto",
        "LotPhoto",
        "ProjectDrawing",
        "PaymentInstruction",
        "GeneralSettings",
      ])
    );
  });

  it("returns the translated model name when available", () => {
    expect(formatAuditModel("Lot", t)).toBe("Lote");
    expect(formatAuditModel("GeneralSettings", t)).toBe(
      "Configuración general"
    );
  });

  it("has English and Spanish labels for every known model", () => {
    AUDIT_MODELS.forEach((model) => {
      expect(en.audits.models[model]).toBeTruthy();
      expect(es.audits.models[model]).toBeTruthy();
    });
  });

  it("humanizes camelCase model names that have no translation", () => {
    expect(formatAuditModel("SomeNewModel", t)).toBe("Some New Model");
    expect(formatAuditEvent("bulk_update", t)).toBe("Bulk Update");
  });

  it("handles missing values", () => {
    expect(formatAuditModel(null, t)).toBe("");
    expect(formatAuditEvent("", t)).toBe("");
  });
});

describe("audit event labels", () => {
  it("returns the translated event name when available", () => {
    expect(formatAuditEvent("update", t)).toBe("Actualizar");
  });
});
