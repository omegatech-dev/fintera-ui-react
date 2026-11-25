import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, beforeEach, vi } from "vitest";

const { authState, MockAuthContext } = vi.hoisted(() => {
  const state = { user: { role: "admin" } };
  return {
    authState: state,
    MockAuthContext: {
      _currentValue: state,
      Provider: ({ children }) => children,
      Consumer: ({ children }) => children,
    },
  };
});

const listIdentityDocuments = vi.fn();
const fetchIdentityDocumentBlob = vi.fn();

const uploadIdentityDocumentForUser = vi.fn();
const uploadIdentityDocumentForContract = vi.fn();

vi.mock("@/features/contracts/api", () => ({
  contractsApi: {
    listIdentityDocuments: (...args) => listIdentityDocuments(...args),
    fetchIdentityDocumentBlob: (...args) => fetchIdentityDocumentBlob(...args),
    uploadIdentityDocumentForUser: (...args) =>
      uploadIdentityDocumentForUser(...args),
    uploadIdentityDocumentForContract: (...args) =>
      uploadIdentityDocumentForContract(...args),
  },
}));

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({
    locale: "es",
    setLocale: () => {},
    t: (key) => {
      const strings = {
        "common.loading": "Cargando...",
        "common.processing": "Procesando...",
        "common.view": "Ver",
        "common.download": "Descargar",
        "common.retry": "Reintentar",
        "common.downloadError": "Error al descargar el archivo",
        "common.downloadSuccess": "Descarga exitosa",
        "contracts.identityDocuments.title": "Documentos del Cliente",
        "contracts.identityDocuments.subtitle": "Documentos de identificación del cliente",
        "contracts.identityDocuments.dni": "DNI",
        "contracts.identityDocuments.rtn": "RTN",
        "contracts.identityDocuments.notUploaded": "Sin documento subido",
        "contracts.identityDocuments.readOnly": "Solo lectura",
        "contracts.identityDocuments.attachments": "Archivos adjuntos al contrato",
        "contracts.identityDocuments.nothingOnFile": "Nada en archivo",
        "contracts.identityDocuments.loadError": "No se pudieron cargar los documentos",
        "contracts.identityDocuments.unnamedFile": "archivo sin nombre",
        "contracts.identityDocuments.upload": "Subir",
        "contracts.identityDocuments.replace": "Reemplazar",
        "contracts.identityDocuments.uploaded": "Documento actualizado",
        "contracts.identityDocuments.uploadError": "No se pudo subir el documento",
        "contracts.identityDocuments.tooLarge": "El archivo {name} supera el límite de 10 MB",
      };
      return strings[key] || key;
    },
  }),
}));

import AuthContext from "@/contexts/AuthContext";
import IdentityDocumentsPanel from "../IdentityDocumentsPanel";

// Render under the same provider wiring the app uses, with a mutable user so
// each test can pick the role.
const renderPanel = (contract = { guid: "guid-9" }) =>
  render(
    <AuthContext.Provider value={authState}>
      <IdentityDocumentsPanel contract={contract} />
    </AuthContext.Provider>
  );

const mockToast = vi.fn();
vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast: mockToast }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  default: MockAuthContext,
  AuthProvider: ({ children }) => children,
}));

const dniFile = {
  id: 3,
  original_filename: "dni.png",
  mime_type: "image/png",
  size_bytes: 2048,
  preview_url: "/api/v1/identity_documents/3/preview",
  download_url: "/api/v1/identity_documents/3/content",
};

const listing = {
  user_id: 7,
  slots: [
    { kind: "dni", source: "upload", read_only: false, document: dniFile },
    { kind: "rtn", source: "upload", read_only: false, document: null },
  ],
  legacy: [
    {
      kind: null,
      source: "legacy",
      read_only: true,
      document: {
        id: 9,
        original_filename: "adjunto.pdf",
        mime_type: "application/pdf",
        size_bytes: 4096,
        download_url: "/api/v1/contracts/guid-9/legacy_documents/9/content",
      },
    },
  ],
};



beforeEach(() => {
  listIdentityDocuments.mockReset();
  fetchIdentityDocumentBlob.mockReset();
  uploadIdentityDocumentForUser.mockReset();
  uploadIdentityDocumentForContract.mockReset();
  uploadIdentityDocumentForUser.mockResolvedValue({});
  uploadIdentityDocumentForContract.mockResolvedValue({});
  mockToast.mockReset();
  authState.user.role = "admin";
  window.open = vi.fn();
});

// Testing-library's auto cleanup requires global afterEach hooks, which this
// project does not enable, so unmount explicitly between tests.
afterEach(() => {
  cleanup();
});

describe("IdentityDocumentsPanel", () => {
  it("lists the DNI slot with its file, the empty RTN slot and the read-only attachment", async () => {
    listIdentityDocuments.mockResolvedValue({ identity_documents: listing });

    renderPanel();

    await waitFor(() =>
      expect(listIdentityDocuments).toHaveBeenCalledWith("guid-9")
    );
    expect(await screen.findByText("dni.png")).toBeTruthy();
    expect(screen.getByText("Sin documento subido")).toBeTruthy();
    expect(screen.getByText("adjunto.pdf")).toBeTruthy();
    expect(screen.getAllByText("Solo lectura").length).toBe(1);
    // The API was called once; the files are only fetched on demand.
    expect(fetchIdentityDocumentBlob).not.toHaveBeenCalled();
  });

  it("reports an empty listing when the client has nothing on file", async () => {
    listIdentityDocuments.mockResolvedValue({
      identity_documents: {
        user_id: 7,
        slots: [
          { kind: "dni", source: "upload", read_only: false, document: null },
          { kind: "rtn", source: "upload", read_only: false, document: null },
        ],
        legacy: [],
      },
    });

    renderPanel();

    expect(await screen.findAllByText("Sin documento subido")).toHaveLength(2);
    expect(screen.getByText("Nada en archivo")).toBeTruthy();
  });

  it("opens the preview blob in a new tab", async () => {
    listIdentityDocuments.mockResolvedValue({ identity_documents: listing });
    fetchIdentityDocumentBlob.mockResolvedValue(new Blob(["webp"]));

    renderPanel();
    const viewButtons = await screen.findAllByText("Ver");
    viewButtons[0].click();

    await waitFor(() =>
      expect(fetchIdentityDocumentBlob).toHaveBeenCalledWith(
        "/api/v1/identity_documents/3/preview"
      )
    );
    await waitFor(() => expect(window.open).toHaveBeenCalledTimes(1));
  });

  const pickFile = (container, filename, kindHint) => {
    // The empty slot and each replace button carry their own file input.
    const inputs = [...container.querySelectorAll('input[type="file"]')];
    const input =
      inputs.find((el) =>
        (el.closest("div")?.textContent || "").includes(kindHint)
      ) || inputs[0];
    const file = new File(["x"], filename, { type: "image/png" });
    Object.defineProperty(input, "files", {
      value: [file],
      configurable: true,
    });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return file;
  };

  it("uploads to the person route when the caller is an admin", async () => {
    listIdentityDocuments.mockResolvedValue({ identity_documents: listing });

    const { container } = renderPanel();
    await screen.findByText("dni.png");

    // Only the empty RTN slot offers "Subir".
    expect(screen.getAllByText("Subir")).toHaveLength(1);
    const file = pickFile(container, "rtn.png", "RTN");

    await waitFor(() =>
      expect(uploadIdentityDocumentForUser).toHaveBeenCalledWith(
        7,
        "rtn",
        file
      )
    );
    expect(uploadIdentityDocumentForContract).not.toHaveBeenCalled();
    // The listing is refreshed after the upload.
    expect(listIdentityDocuments.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("uploads through the contract route when the caller is a seller", async () => {
    authState.user.role = "seller";
    listIdentityDocuments.mockResolvedValue({ identity_documents: listing });

    const { container } = renderPanel();
    await screen.findByText("dni.png");

    const file = pickFile(container, "rtn.png", "RTN");

    await waitFor(() =>
      expect(uploadIdentityDocumentForContract).toHaveBeenCalledWith(
        "guid-9",
        "rtn",
        file
      )
    );
    expect(uploadIdentityDocumentForUser).not.toHaveBeenCalled();
  });

  it("offers Reemplazar on a populated slot", async () => {
    listIdentityDocuments.mockResolvedValue({ identity_documents: listing });

    const { container } = renderPanel();
    await screen.findByText("dni.png");

    expect(screen.getByText("Reemplazar")).toBeTruthy();
    const file = pickFile(container, "nuevo-dni.png", "DNI");

    await waitFor(() =>
      expect(uploadIdentityDocumentForUser).toHaveBeenCalledWith(7, "dni", file)
    );
  });

  it("rejects a file over 10 MB without calling the API", async () => {
    listIdentityDocuments.mockResolvedValue({ identity_documents: listing });

    const { container } = renderPanel();
    await screen.findByText("dni.png");

    const big = new File(["x"], "huge.png", { type: "image/png" });
    Object.defineProperty(big, "size", { value: 11 * 1024 * 1024 });
    const input = container.querySelector('input[type="file"]');
    Object.defineProperty(input, "files", {
      value: [big],
      configurable: true,
    });
    input.dispatchEvent(new Event("change", { bubbles: true }));

    await waitFor(() => expect(mockToast).toHaveBeenCalled());
    // The test's t() does not interpolate {name}; assert on the fixed part.
    expect(
      mockToast.mock.calls.some(
        ([message, tone]) =>
          tone === "error" && String(message).includes("10 MB")
      )
    ).toBe(true);
    expect(uploadIdentityDocumentForUser).not.toHaveBeenCalled();
  });

  it("surfaces the backend 422 message on upload", async () => {
    listIdentityDocuments.mockResolvedValue({ identity_documents: listing });
    uploadIdentityDocumentForUser.mockRejectedValue({
      message: 'el archivo "bad.gif" no tiene un tipo permitido (image/gif)',
      status: 422,
    });

    const { container } = renderPanel();
    await screen.findByText("dni.png");

    pickFile(container, "bad.gif", "RTN");

    await waitFor(() =>
      expect(
        mockToast.mock.calls.some(
          ([message]) => String(message).includes("bad.gif")
        )
      ).toBe(true)
    );
  });

  it("hides itself when the caller has no scope (403)", async () => {
    listIdentityDocuments.mockRejectedValue({ status: 403 });

    const { container } = renderPanel();

    await waitFor(() => expect(listIdentityDocuments).toHaveBeenCalled());
    expect(container.textContent).toBe("");
  });

  it("shows a retry button on other errors", async () => {
    listIdentityDocuments.mockRejectedValue(new Error("boom"));

    renderPanel();

    expect(await screen.findByText("Reintentar")).toBeTruthy();
  });
});
