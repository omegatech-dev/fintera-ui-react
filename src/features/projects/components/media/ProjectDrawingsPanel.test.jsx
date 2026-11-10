import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import ProjectDrawingsPanel from "./ProjectDrawingsPanel";
import { projectsApi } from "../../api";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../../api", () => ({
  projectsApi: {
    listDrawings: vi.fn(),
    uploadDrawings: vi.fn(),
    updateDrawing: vi.fn(),
    deleteDrawing: vi.fn(),
  },
}));

vi.mock("../../../../contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("../../../../contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  projectsApi.listDrawings.mockResolvedValue({
    drawings: [
      {
        id: 1,
        name: "Levantamiento",
        file_type: "dwg",
        version: "v2",
        size_bytes: 1024,
        download_url: "/uploads/projects/a.dwg",
      },
    ],
  });
});

describe("ProjectDrawingsPanel", () => {
  it("lists drawings and shows the type and version", async () => {
    render(<ProjectDrawingsPanel projectId="7" canManage />);

    expect(await screen.findByText("Levantamiento")).toBeInTheDocument();
    expect(screen.getByText("DWG")).toBeInTheDocument();
    expect(screen.getByText(/v2/)).toBeInTheDocument();
  });

  it("rejects a disallowed file before uploading", async () => {
    const { container } = render(<ProjectDrawingsPanel projectId="7" canManage />);
    await screen.findByText("Levantamiento");

    const input = container.querySelector('input[type="file"]');
    const badFile = new File(["x"], "plan.exe", { type: "application/octet-stream" });
    fireEvent.change(input, { target: { files: [badFile] } });

    expect(screen.getByText(/plan.exe/)).toBeInTheDocument();
    expect(projectsApi.uploadDrawings).not.toHaveBeenCalled();
  });
});
