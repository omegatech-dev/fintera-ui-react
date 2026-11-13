import { memo, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import PropTypes from "prop-types";
import ChartDataTable from "./ChartDataTable";

const SellerPerformance = memo(
  ({ sellersPerformance, sellerChartOptions, t, formatCurrency }) => {
    const sellerPerformanceChartData = useMemo(() => {
      if (!sellersPerformance || sellersPerformance.length === 0)
        return { labels: [], datasets: [] };

      return {
        labels: sellersPerformance.map((seller) => seller.seller_name),
        datasets: [
          {
            type: "bar",
            label: t("analytics.totalSales"),
            data: sellersPerformance.map((seller) => seller.total_sales),
            backgroundColor: "rgba(22, 163, 74, 0.75)",
            borderColor: "rgb(22, 163, 74)",
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: "y",
          },
          {
            type: "line",
            label: t("analytics.contractsSold"),
            data: sellersPerformance.map((seller) => seller.active_contracts),
            borderColor: "rgb(29, 78, 216)",
            backgroundColor: "rgba(29, 78, 216, 0.15)",
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: false,
            tension: 0.4,
            yAxisID: "y1",
          },
        ],
      };
    }, [sellersPerformance, t]);

    const topSellers = useMemo(
      () =>
        [...sellersPerformance]
          .sort((a, b) => b.total_sales - a.total_sales)
          .slice(0, 3),
      [sellersPerformance]
    );

    return (
      <section
        id="seller-performance-section"
        role="region"
        aria-label={t("analytics.sellerPerformance")}
        className="rounded-card border border-line bg-surface p-5"
      >
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h3 className="text-title font-bold text-ink">
              {t("analytics.sellerPerformance")}
            </h3>
            <p className="mt-0.5 text-label text-ink-3">
              {t("analytics.salesBySeller")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-control bg-surface-2 px-2.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-brand" />
              <span className="text-micro font-semibold text-ink-2">
                {t("analytics.totalSales")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-control bg-surface-2 px-2.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-info" />
              <span className="text-micro font-semibold text-ink-2">
                {t("analytics.contractsSold")}
              </span>
            </div>
          </div>
        </div>

        <div
          className="mt-4 h-[320px] w-full text-ink-2"
          role="img"
          aria-label={t("analytics.sellerPerformance")}
        >
          <Bar data={sellerPerformanceChartData} options={sellerChartOptions} />
        </div>

        <ChartDataTable
          caption={t("analytics.sellerPerformance")}
          columns={[
            t("analytics.sellerLabel"),
            t("analytics.totalSales"),
            t("analytics.contractsSold"),
          ]}
          rows={sellersPerformance.map((seller) => [
            seller.seller_name,
            formatCurrency(seller.total_sales),
            seller.active_contracts,
          ])}
        />

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {topSellers.map((seller, index) => (
            <div
              key={seller.seller_id}
              className="flex items-center gap-3 rounded-control border border-line bg-surface-2 p-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-label font-bold text-brand-strong">
                {index + 1}
              </div>
              <div className="min-w-0">
                <h4 className="truncate text-label font-semibold text-ink">
                  {seller.seller_name}
                </h4>
                <div className="mt-0.5 flex items-center gap-1.5 text-micro font-semibold">
                  <span className="text-brand-strong">
                    {formatCurrency(seller.total_sales)}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-line-strong" />
                  <span className="text-info">
                    {seller.active_contracts}{" "}
                    {t("analytics.contractsSold")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
);

SellerPerformance.displayName = "SellerPerformance";

SellerPerformance.propTypes = {
  sellersPerformance: PropTypes.array,
  sellerChartOptions: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  formatCurrency: PropTypes.func.isRequired,
};

export default SellerPerformance;
