import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import PhotoDropzone from "./PhotoDropzone";
import { PHOTO_MAX_BYTES } from "./mediaFiles";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../../../../contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

describe("PhotoDropzone", () => {
  it("emits valid photos dropped onto the zone", () => {
    const onFiles = vi.fn();
    render(<PhotoDropzone onFiles={onFiles} />);

    fireEvent.drop(screen.getByRole("button", { name: "media.dropPhotos" }), {
      dataTransfer: { files: [{ name: "front.jpg", size: 1024 }] },
    });

    expect(onFiles).toHaveBeenCalledWith([{ name: "front.jpg", size: 1024 }]);
  });

  it("reports rejected types and sizes without emitting files", () => {
    const onFiles = vi.fn();
    render(<PhotoDropzone onFiles={onFiles} />);

    fireEvent.drop(screen.getByRole("button", { name: "media.dropPhotos" }), {
      dataTransfer: {
        files: [
          { name: "bad.gif", size: 1024 },
          { name: "huge.png", size: PHOTO_MAX_BYTES + 1 },
        ],
      },
    });

    expect(onFiles).not.toHaveBeenCalled();
    expect(screen.getByText(/bad.gif: media.errorPhotoType/)).toBeInTheDocument();
    expect(screen.getByText(/huge.png: media.errorSize/)).toBeInTheDocument();
  });
});
