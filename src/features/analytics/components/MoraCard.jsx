import { memo } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Card } from "@/shared/ui";

const MoraCard = memo(({ amount, installments, clients, formatCurrency, t }) => {
    const hasBreakdown =
        installments !== null &&
        installments !== undefined &&
        clients !== null &&
        clients !== undefined &&
        Number.isFinite(Number(installments)) &&
        Number.isFinite(Number(clients));

    return (
        <div aria-label={t("analytics.moraTitle")} role="group">
            <Card
                title={<span className="text-danger">{t("analytics.moraTitle")}</span>}
                className="h-full border-danger/30 bg-danger-soft/40"
                bodyClassName="flex h-full flex-col gap-3 p-5"
            >
                <p className="text-page font-bold text-danger">
                    {formatCurrency(amount ?? 0)}
                </p>
                <p className="text-micro font-medium text-danger">
                    {hasBreakdown
                        ? t("analytics.moraBreakdown", {
                            installments,
                            clients,
                        })
                        : t("analytics.moraCaptionNeutral")}
                </p>
                <Link
                    to="/payments?status=overdue"
                    className="mt-auto inline-flex w-fit items-center gap-1 text-label font-bold text-danger hover:underline"
                >
                    <span>{t("analytics.viewCollections")}</span>
                    <span aria-hidden="true">→</span>
                </Link>
            </Card>
        </div>
    );
});

MoraCard.displayName = "MoraCard";

MoraCard.propTypes = {
    amount: PropTypes.number,
    installments: PropTypes.number,
    clients: PropTypes.number,
    formatCurrency: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
};

export default MoraCard;
