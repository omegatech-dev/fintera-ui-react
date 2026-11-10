import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import PhotoGalleryManager from "./PhotoGalleryManager";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../../../../contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("../../../../contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const PHOTOS = [
  { id: 10, position: 0, url: "/uploads/projects/a.jpg", alt: "Portada" },
  { id: 11, position: 1, url: "/uploads/projects/b.jpg", alt: "Segunda" },
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

  it("shows only the photo upload guidance and a drop zone", () => {
    render(
      <PhotoGalleryManager
        title="Fotos"
        photos={PHOTOS}
        canManage
        loading={false}
        error={null}
        onUpload={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getAllByText("media.photosHint").length).toBeGreaterThan(0);
    expect(screen.queryByText("media.drawingsHint")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "media.dropPhotos" })
    ).toBeInTheDocument();
  });

  it("uploads dropped files without a separate send step", async () => {
    const onUpload = vi.fn().mockResolvedValue({});

    render(
      <PhotoGalleryManager
        title="Fotos"
        photos={PHOTOS}
        canManage
        loading={false}
        error={null}
        onUpload={onUpload}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    fireEvent.drop(screen.getByRole("button", { name: "media.dropPhotos" }), {
      dataTransfer: {
        files: [new File(["x"], "new.jpg", { type: "image/jpeg" })],
      },
    });

    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
    const formData = onUpload.mock.calls[0][0];
    expect(formData.get("photos[0]").name).toBe("new.jpg");
    expect(screen.queryByRole("button", { name: "media.send" })).not.toBeInTheDocument();
  });

  it("renders photos in server position order", () => {
    render(
      <PhotoGalleryManager
        title="Fotos"
        photos={[
          { id: 3, position: 2, url: "/uploads/projects/c.jpg", alt: "Third" },
          { id: 1, position: 0, url: "/uploads/projects/a.jpg", alt: "First" },
          { id: 2, position: 1, url: "/uploads/projects/b.jpg", alt: "Second" },
        ]}
        canManage={false}
        loading={false}
        error={null}
        onUpload={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const alts = screen.getAllByRole("img").map((image) => image.getAttribute("alt"));
    expect(alts).toEqual(["First", "Second", "Third"]);
  });

  it("renders photos without an id without crashing", () => {
    render(
      <PhotoGalleryManager
        title="Fotos"
        photos={[{ url: "/uploads/projects/no-id.jpg", alt: null }]}
        canManage
        loading={false}
        error={null}
        onUpload={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText("media.noAlt")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Alt" })).not.toBeInTheDocument();
  });

  it("hides the upload zone when the user cannot manage media", () => {
    render(
      <PhotoGalleryManager
        title="Fotos"
        photos={PHOTOS}
        canManage={false}
        loading={false}
        error={null}
        onUpload={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(
      screen.queryByRole("button", { name: "media.dropPhotos" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("Portada")).toBeInTheDocument();
  });
});
