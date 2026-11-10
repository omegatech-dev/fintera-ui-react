import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import PhotoGalleryManager from "./PhotoGalleryManager";

afterEach(cleanup);

vi.mock("../../../../contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("../../../../contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const PHOTOS = [
  { id: 10, url: "/uploads/projects/a.jpg", alt: "Portada" },
  { id: 11, url: "/uploads/projects/b.jpg", alt: "Segunda" },
];

describe("PhotoGalleryManager", () => {
  it("promotes a photo to cover and moves it to the top", () => {
    const onUpdate = vi.fn().mockResolvedValue({});

    render(
      <PhotoGalleryManager
        title="Fotos"
        photos={PHOTOS}
        canManage
        loading={false}
        error={null}
        onUpload={vi.fn()}
        onUpdate={onUpdate}
        onDelete={vi.fn()}
      />
    );

    const coverButtons = screen.getAllByRole("button", { name: "media.setCover" });
    fireEvent.click(coverButtons[1]);

    expect(onUpdate).toHaveBeenCalledWith(11, { position: -1 });
  });

  it("saves the alternative text", async () => {
    const onUpdate = vi.fn().mockResolvedValue({});

    render(
      <PhotoGalleryManager
        title="Fotos"
        photos={PHOTOS}
        canManage
        loading={false}
        error={null}
        onUpload={vi.fn()}
        onUpdate={onUpdate}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Alt" })[1]);
    const input = screen.getByPlaceholderText("media.altText");
    fireEvent.change(input, { target: { value: "Vista al lago" } });
    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    expect(onUpdate).toHaveBeenCalledWith(11, { alt: "Vista al lago" });
  });
});
