import { describe, expect, it } from "vitest";
import {
  DRAWING_MAX_BYTES,
  PHOTO_MAX_BYTES,
  fileExtension,
  formatBytes,
  validateDrawingFile,
  validatePhotoFile,
} from "./mediaFiles";

function file(name, size = 1024) {
  return { name, size };
}

describe("media file validation", () => {
  it("accepts drawing types and enforces the size limit", () => {
    expect(validateDrawingFile(file("plan.svg")).ok).toBe(true);
    expect(validateDrawingFile(file("plan.png")).ok).toBe(true);
    expect(validateDrawingFile(file("plan.jpg")).ok).toBe(true);
    expect(validateDrawingFile(file("plan.JPEG")).ok).toBe(true);
    expect(validateDrawingFile(file("plan.pdf")).ok).toBe(true);

    expect(validateDrawingFile(file("plan.dwg"))).toEqual({ ok: false, reason: "type" });
    expect(validateDrawingFile(file("plan.dxf"))).toEqual({ ok: false, reason: "type" });
    expect(validateDrawingFile(file("plan.exe"))).toEqual({ ok: false, reason: "type" });
    expect(validateDrawingFile(file("plan.svg", DRAWING_MAX_BYTES + 1))).toEqual({
      ok: false,
      reason: "size",
    });
  });

  it("accepts photo types and enforces the size limit", () => {
    expect(validatePhotoFile(file("photo.jpg")).ok).toBe(true);
    expect(validatePhotoFile(file("photo.webp")).ok).toBe(true);
    expect(validatePhotoFile(file("photo.gif"))).toEqual({ ok: false, reason: "type" });
    expect(validatePhotoFile(file("photo.png", PHOTO_MAX_BYTES + 1))).toEqual({
      ok: false,
      reason: "size",
    });
  });

  it("formats extensions and byte sizes", () => {
    expect(fileExtension("Plan.DWG")).toBe("dwg");
    expect(fileExtension("no-extension")).toBe("no-extension");
    expect(formatBytes(0)).toBe("—");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });
});
