import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import Button from "../Button";
import Field from "../Field";
import Input from "../Input";
import Dialog from "../Dialog";
import ConfirmDialog from "../ConfirmDialog";

expect.extend(matchers);
afterEach(cleanup);

describe("Button", () => {
  it("renders its label and marks loading with aria-busy", () => {
    const { rerender } = render(<Button>Guardar</Button>);
    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();

    rerender(<Button loading>Guardar</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

describe("Field", () => {
  it("wires the error message to the control", () => {
    render(
      <Field label="Correo" error="Correo requerido">
        <Input />
      </Field>
    );

    const input = screen.getByLabelText("Correo");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Correo requerido");
  });
});

describe("Dialog", () => {
  it("exposes dialog semantics and closes on Escape", () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="Aprobar pago">
        Contenido
      </Dialog>
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Aprobar pago");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render when closed", () => {
    render(
      <Dialog open={false} title="Cerrado">
        Contenido
      </Dialog>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("ConfirmDialog", () => {
  it("calls onConfirm from the confirm action", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        onClose={() => {}}
        onConfirm={onConfirm}
        title="Cancelar contrato"
        confirmLabel="Sí, cancelar"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Sí, cancelar" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
