import { memo, useMemo } from "react";
import PropTypes from "prop-types";
import { Card } from "@/shared/ui";
import ChartDataTable from "./ChartDataTable";

const GrowthByProject = memo(({ projects, performance, t }) => {
    const rows = useMemo(() => {
        const performanceList = Array.isArray(performance) ? performance : [];
        const performanceByName = new Map();
        performanceList.forEach((item) => {
            if (item?.project_name) performanceByName.set(item.project_name, item);
        });

        const seen = new Set();
        const entries = [];

        (projects || []).forEach((project) => {
            if (!project?.name || seen.has(project.name)) return;
            seen.add(project.name);
            entries.push({
                key: `project-${project.id ?? project.name}`,
                name: project.name,
                performance: performanceByName.get(project.name),
            });
        });

        performanceList.forEach((item) => {
            if (!item?.project_name || seen.has(item.project_name)) return;
            seen.add(item.project_name);
            entries.push({
                key: `performance-${item.project_id ?? item.project_name}`,
                name: item.project_name,
                performance: item,
            });
        });

        return entries.map((entry) => {
            const rawGrowth = entry.performance?.growth_percentage;
            const hasGrowth =
                rawGrowth !== null &&
                rawGrowth !== undefined &&
                Number.isFinite(Number(rawGrowth));
            const growth = hasGrowth ? Number(rawGrowth) : null;

            return {
                ...entry,
                growth,
                label: hasGrowth
                    ? `${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`
                    : t("analytics.noPrevious"),
                width: hasGrowth ? Math.min(Math.abs(growth), 100) : 0,
            };
        });
    }, [projects, performance, t]);

    return (
        <div aria-label={t("analytics.growthTitle")} role="group">
            <Card
                title={t("analytics.growthTitle")}
                action={
                    <span className="text-micro font-medium text-ink-3">
                        {t("analytics.growthSubtitle")}
                    </span>
                }
                className="h-full"
                bodyClassName="flex flex-col gap-3 p-5"
            >
                {rows.length === 0 ? (
                    <p className="text-body text-ink-3">
                        {t("analytics.growthNoProjects")}
                    </p>
                ) : (
                    rows.map((row) => (
                        <div key={row.key} className="flex items-center gap-3">
                            <span
                                className="w-36 shrink-0 truncate text-label font-semibold text-ink-2"
                                title={row.name}
                            >
                                {row.name}
                            </span>
                            <div
                                className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-2"
                                aria-hidden="true"
                            >
                                <div
                                    className={`h-full rounded-full ${row.growth !== null && row.growth < 0 ? "bg-danger" : "bg-brand"
                                        }`}
                                    style={{ width: `${row.width}%` }}
                                />
                            </div>
                            <span
                                className={`w-24 shrink-0 text-right text-label font-bold ${row.growth !== null && row.growth < 0
                                        ? "text-danger"
                                        : row.growth !== null
                                            ? "text-brand-strong"
                                            : "text-ink-3"
                                    }`}
                            >
                                {row.label}
                            </span>
                        </div>
                    ))
                )}
                <ChartDataTable
                    caption={t("analytics.growthTitle")}
                    columns={[
                        t("analytics.projectLabel"),
                        t("analytics.growthAnalysis"),
                    ]}
                    rows={rows.map((row) => [row.name, row.label])}
                />
            </Card>
        </div>
    );
});

GrowthByProject.displayName = "GrowthByProject";

GrowthByProject.propTypes = {
    projects: PropTypes.array,
    performance: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    t: PropTypes.func.isRequired,
};

export default GrowthByProject;
