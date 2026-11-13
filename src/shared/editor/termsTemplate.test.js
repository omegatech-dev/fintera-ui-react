import { describe, it, expect } from "vitest";
import { buildDefaultTermsHtml } from "./termsTemplate";

describe("buildDefaultTermsHtml", () => {
  it("builds numbered Spanish HTML with headings, bold-ready paragraphs and lists", () => {
    const html = buildDefaultTermsHtml("es");

    expect(html).toContain("<h2>1. Aceptación</h2>");
    expect(html).toContain("<h2>3. Registro de Cuenta</h2>");
    expect(html).toContain("<ul><li>Para acceder a ciertas funciones");
    expect(html).toContain("<h2>10. Modificaciones</h2>");
    expect(html).not.toContain("Información de Contacto");
    expect(html).not.toContain("footerNote");
  });

  it("builds the English template and escapes markup from translations", () => {
    const html = buildDefaultTermsHtml("en");

    expect(html).toContain("<h2>1. Acceptance</h2>");
    expect(html).toContain("<h2>6. Notifications and Communications</h2>");
    expect(html).not.toContain("Contact Information");
    expect(html).not.toContain("<script");
  });
});
