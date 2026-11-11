import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { MemoryRouter } from "react-router-dom";

import RecentActivity, { formatTimeAgo, resolveActivityUser } from "./RecentActivity";
import { auditsApi } from "../../audits/api";

expect.extend(matchers);
afterEach(cleanup);

const { t } = vi.hoisted(() => {
    const translations = {
        "common.justNow": "Justo ahora",
        "common.timeAgo.minutes": "hace {count} min",
        "common.timeAgo.hours": "hace {count} h",
        "common.timeAgo.days": "hace {count} días",
        "common.viewAll": "Ver Todo",
        "dashboard.recentActivity": "Actividad Reciente",
        "dashboard.recentActivityDesc": "Últimos eventos y actualizaciones del sistema",
        "dashboard.activityUserNumber": "Usuario #{id}",
        "audits.system": "Sistema",
        "audits.events.approve": "Aprobar",
    };

    return {
        t: (key, params = {}) => {
            const template = translations[key] ?? key;
            return Object.entries(params).reduce(
                (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
                template,
            );
        },
    };
});

vi.mock("@/contexts/LocaleContext", () => ({
    useLocale: () => ({ t, locale: "es" }),
}));

vi.mock("../../audits/api", () => ({
    auditsApi: { list: vi.fn() },
}));

vi.mock("framer-motion", () => ({
    motion: { div: ({ children }) => <div>{children}</div> },
}));

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

describe("resolveActivityUser", () => {
    it("prefers the nested user's full name", () => {
        expect(resolveActivityUser({ user: { full_name: "Ana Pérez", email: "ana@example.com" } }, t))
            .toBe("Ana Pérez");
    });

    it("falls back to the nested user's email", () => {
        expect(resolveActivityUser({ user: { email: "ana@example.com" } }, t)).toBe("ana@example.com");
    });

    it("labels a numeric user id instead of rendering it bare", () => {
        expect(resolveActivityUser({ user_id: 1 }, t)).toBe("Usuario #1");
    });

    it("falls back to the system label when there is no actor", () => {
        expect(resolveActivityUser({}, t)).toBe("Sistema");
    });
});

describe("formatTimeAgo", () => {
    const now = new Date("2026-11-11T12:00:00Z");

    it("localizes days", () => {
        const created = new Date(now.getTime() - 252 * 24 * 60 * 60 * 1000).toISOString();
        expect(formatTimeAgo(created, now, t)).toBe("hace 252 días");
    });

    it("localizes hours and minutes", () => {
        expect(formatTimeAgo(new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), now, t))
            .toBe("hace 3 h");
        expect(formatTimeAgo(new Date(now.getTime() - 10 * 60 * 1000).toISOString(), now, t))
            .toBe("hace 10 min");
    });
});

describe("RecentActivity", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the actor name, translated action and localized time", async () => {
        auditsApi.list.mockResolvedValue({
            audits: [
                {
                    id: 1,
                    action: "approve",
                    details: "Pago aprobado para contrato #95",
                    created_at: daysAgo(252),
                    user: { full_name: "Ana Pérez" },
                },
            ],
        });

        render(
            <MemoryRouter>
                <RecentActivity />
            </MemoryRouter>,
        );

        expect(await screen.findByText("Ana Pérez")).toBeInTheDocument();
        expect(screen.getByText("Aprobar")).toBeInTheDocument();
        expect(screen.getByText(/hace 252 días/)).toBeInTheDocument();
        expect(screen.queryByText("APPROVE")).not.toBeInTheDocument();
    });

    it("shows a labelled user id when the payload only has a numeric id", async () => {
        auditsApi.list.mockResolvedValue({
            audits: [
                {
                    id: 2,
                    action: "approve",
                    details: "Pago aprobado para contrato #90",
                    created_at: daysAgo(257),
                    user_id: 1,
                },
            ],
        });

        render(
            <MemoryRouter>
                <RecentActivity />
            </MemoryRouter>,
        );

        expect(await screen.findByText("Usuario #1")).toBeInTheDocument();
        expect(screen.queryByText("1")).not.toBeInTheDocument();
    });
});
