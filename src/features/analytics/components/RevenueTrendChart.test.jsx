import { describe, expect, it } from "vitest";

import { localizeMonth } from "./monthLabels";

const ES_MONTHS = {
  "common.months.jan": "Ene",
  "common.months.feb": "Feb",
  "common.months.nov": "Nov",
  "common.months.dec": "Dic",
};

describe("RevenueTrendChart month labels", () => {
  it("localizes API month abbreviations with the app locale", () => {
    const t = (key) => ES_MONTHS[key] ?? key;

    expect(localizeMonth("Jan", t)).toBe("Ene");
    expect(localizeMonth("Nov", t)).toBe("Nov");
    expect(localizeMonth("Dec", t)).toBe("Dic");
    expect(localizeMonth("W1", t)).toBe("W1");
  });
});
