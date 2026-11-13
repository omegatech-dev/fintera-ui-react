import {
  faBan,
  faCircleCheck,
  faCircleInfo,
  faCoins,
  faImage,
  faKey,
  faPen,
  faPlus,
  faRightToBracket,
  faToggleOn,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { normalizeAuditAction } from "../modelLabels";

const ACTION_META = {
  create: { icon: faPlus, tone: "violet" },
  update: { icon: faPen, tone: "info" },
  destroy: { icon: faTrash, tone: "danger" },
  approve: { icon: faCircleCheck, tone: "success" },
  reject: { icon: faBan, tone: "danger" },
  cancel: { icon: faBan, tone: "danger" },
  close: { icon: faCircleInfo, tone: "neutral" },
  login: { icon: faRightToBracket, tone: "info" },
  capital_repayment: { icon: faCoins, tone: "success" },
  force_change_password: { icon: faKey, tone: "warning" },
  update_picture: { icon: faImage, tone: "violet" },
  toggle_status: { icon: faToggleOn, tone: "warning" },
};

const FALLBACK = { icon: faCircleInfo, tone: "neutral" };

export const getAuditActionMeta = (action) => {
  const normalized = normalizeAuditAction(action);
  return ACTION_META[normalized] ?? FALLBACK;
};

export const ACTION_TONES = {
  success: "bg-brand-soft text-brand-strong",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  violet: "bg-violet-soft text-violet",
  neutral: "border border-line bg-surface-2 text-ink-2",
};
