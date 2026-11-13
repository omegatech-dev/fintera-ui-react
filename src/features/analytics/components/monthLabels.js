export const MONTH_KEYS = {
  Jan: "common.months.jan",
  Feb: "common.months.feb",
  Mar: "common.months.mar",
  Apr: "common.months.apr",
  May: "common.months.may",
  Jun: "common.months.jun",
  Jul: "common.months.jul",
  Aug: "common.months.aug",
  Sep: "common.months.sep",
  Oct: "common.months.oct",
  Nov: "common.months.nov",
  Dec: "common.months.dec",
};

export const monthOrder = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export const localizeMonth = (label, t) => {
  const key = MONTH_KEYS[label];
  return key ? t(key) : label;
};
