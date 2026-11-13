import { describe, expect, it } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import {
  isNewSellerScore,
  scoreLabel,
  scoreLevel,
  scoreTone,
} from "./score";

expect.extend(matchers);

const t = (key) =>
  ({
    "score.high": "Alta",
    "score.medium": "Media",
    "score.low": "Baja",
    "score.new": "Nuevo",
  })[key] ?? key;

describe("scoreLevel", () => {
  it("maps values to the acceptance levels", () => {
    expect(scoreLevel(100)).toBe("high");
    expect(scoreLevel(85)).toBe("high");
    expect(scoreLevel(84)).toBe("medium");
    expect(scoreLevel(60)).toBe("medium");
    expect(scoreLevel(59)).toBe("low");
    expect(scoreLevel(0)).toBe("low");
  });

  it("treats a missing score as a new seller", () => {
    expect(scoreLevel(null)).toBe("high");
    expect(scoreLevel(undefined)).toBe("high");
    expect(scoreLevel("")).toBe("high");
    expect(isNewSellerScore(null)).toBe(true);
    expect(isNewSellerScore(0)).toBe(false);
  });
});

describe("scoreLabel", () => {
  it("labels the level of a known score", () => {
    expect(scoreLabel(t, 90)).toBe("Alta");
    expect(scoreLabel(t, 70)).toBe("Media");
    expect(scoreLabel(t, 20)).toBe("Baja");
  });

  it("labels a seller without history as new", () => {
    expect(scoreLabel(t, null)).toBe("Nuevo");
  });
});

describe("scoreTone", () => {
  it("maps levels to chip tones", () => {
    expect(scoreTone("high")).toBe("success");
    expect(scoreTone("medium")).toBe("warning");
    expect(scoreTone("low")).toBe("danger");
  });
});
