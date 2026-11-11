import { describe, it, expect } from "vitest";
import {
  evaluateLogoDimensions,
  formatFileSize,
  getFileValidationError,
} from "./logoRules";

const makeFile = (name, type, bytes) =>
  new File([new Uint8Array(bytes)], name, { type });

describe("logoRules", () => {
  it("formats file sizes for kilobytes and megabytes", () => {
    expect(formatFileSize(512)).toBe("1 KB");
    expect(formatFileSize(1536)).toBe("2 KB");
    expect(formatFileSize(2 * 1024 * 1024)).toBe("2 MB");
  });

  it("accepts supported image types under the size limit", () => {
    expect(getFileValidationError(makeFile("logo.png", "image/png", 1024))).toBeNull();
    expect(getFileValidationError(makeFile("logo.webp", "image/webp", 1024))).toBeNull();
    expect(getFileValidationError(makeFile("logo.jpg", "image/jpeg", 1024))).toBeNull();
  });

  it("rejects unsupported types and oversized files", () => {
    expect(getFileValidationError(makeFile("notes.txt", "text/plain", 10))).toBe("type");
    expect(
      getFileValidationError(makeFile("huge.png", "image/png", 2 * 1024 * 1024 + 1))
    ).toBe("size");
  });

  it("warns when the image is below the recommended size", () => {
    expect(evaluateLogoDimensions(320, 80).status).toBe("small");
    expect(evaluateLogoDimensions(300, 100).status).toBe("small");
  });

  it("warns when the aspect ratio is far from horizontal", () => {
    expect(evaluateLogoDimensions(640, 640).status).toBe("ratio");
    expect(evaluateLogoDimensions(1200, 160).status).toBe("ratio");
  });

  it("accepts recommended and close-to-recommended sizes", () => {
    expect(evaluateLogoDimensions(640, 160).status).toBe("good");
    expect(evaluateLogoDimensions(800, 200).status).toBe("good");
  });
});
