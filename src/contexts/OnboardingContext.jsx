import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useLocale } from "./LocaleContext";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const OnboardingContext = createContext();

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error("useOnboarding must be used within an OnboardingProvider");
    }
    return context;
};

export const OnboardingProvider = ({ children }) => {
    const { t } = useLocale();

    // Cache completed tours in state using lazy initialization
    const [completedTours, setCompletedTours] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("fintera_onboarding_status") || "{}");
        } catch {
            return {};
        }
    });

    // Helper to check if a specific tour is completed
    const isTourCompleted = useCallback((tourKey) => {
        return !!completedTours[tourKey];
    }, [completedTours]);

    // Helper to mark a specific tour as completed
    const markTourCompleted = useCallback((tourKey) => {
        setCompletedTours((prev) => {
            const next = { ...prev, [tourKey]: true };
            localStorage.setItem("fintera_onboarding_status", JSON.stringify(next));
            return next;
        });
    }, []);

    const startTour = useCallback((tourKey = "home") => {
        // Define steps for each tour
        const stepsConfig = {
            home: [
                {
                    element: "#sidebar-home",
                    popover: {
                        title: t("onboarding.welcome.title") || "Welcome to Fintera!",
                        description: t("onboarding.welcome.desc") || "This is your main dashboard where you can see a summary of all activities.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#quick-actions",
                    popover: {
                        title: t("onboarding.quickActions.title") || "Quick Actions",
                        description: t("onboarding.quickActions.desc") || "Access the most common tasks like registering payments or creating contracts directly from here.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#recent-activity",
                    popover: {
                        title: t("onboarding.recentActivity.title") || "Recent Activity",
                        description: t("onboarding.recentActivity.desc") || "Keep track of all system events and audits in real-time.",
                        side: "left",
                        align: "start"
                    }
                },
                {
                    element: "#sidebar-projects",
                    popover: {
                        title: t("onboarding.projects.title") || "Project Management",
                        description: t("onboarding.projects.desc") || "Manage your real estate projects and inventory here.",
                        side: "left",
                        align: "center"
                    }
                },
                {
                    element: "#sidebar-payments",
                    popover: {
                        title: t("onboarding.payments.title") || "Payments & Financing",
                        description: t("onboarding.payments.desc") || "Monitor and record client payments efficiently.",
                        side: "left",
                        align: "center"
                    }
                },
                {
                    element: "#profile-trigger",
                    popover: {
                        title: t("onboarding.profile.title") || "Your Profile",
                        description: t("onboarding.profile.desc") || "Access your settings, change language, or restart this tour anytime from here.",
                        side: "bottom",
                        align: "end"
                    }
                }
            ],
            sellerHome: [
                {
                    element: "#seller-dashboard-hero",
                    popover: {
                        title: t("onboarding.sellerHome.welcome.title") || "Welcome to Fintera!",
                        description: t("onboarding.sellerHome.welcome.desc") || "This is your seller dashboard. Here you can see your sales performance, active leads, and commissions.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#seller-dashboard-stats",
                    popover: {
                        title: t("onboarding.sellerHome.stats.title") || "Key Metrics",
                        description: t("onboarding.sellerHome.stats.desc") || "Your sales volume, active leads, estimated commission, and conversion rate at a glance.",
                        side: "top",
                        align: "start"
                    }
                },
                {
                    element: "#seller-new-sale-btn",
                    popover: {
                        title: t("onboarding.sellerHome.newSale.title") || "New Sale",
                        description: t("onboarding.sellerHome.newSale.desc") || "Start a new sale by selecting a project and reserving a lot for your client.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#seller-add-lead-btn",
                    popover: {
                        title: t("onboarding.sellerHome.addLead.title") || "Add Lead",
                        description: t("onboarding.sellerHome.addLead.desc") || "Register new leads (prospects) to track and follow up on potential sales.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#seller-performance-chart",
                    popover: {
                        title: t("onboarding.sellerHome.performanceChart.title") || "Performance Trend",
                        description: t("onboarding.sellerHome.performanceChart.desc") || "See how your sales are trending over the selected month.",
                        side: "top",
                        align: "start"
                    }
                },
                {
                    element: "#seller-recent-customers",
                    popover: {
                        title: t("onboarding.sellerHome.recentCustomers.title") || "Recent Customers",
                        description: t("onboarding.sellerHome.recentCustomers.desc") || "Quick view of your latest sales and customer activity.",
                        side: "left",
                        align: "start"
                    }
                },
                {
                    element: "#seller-view-commissions-btn",
                    popover: {
                        title: t("onboarding.sellerHome.viewCommissions.title") || "View Commissions",
                        description: t("onboarding.sellerHome.viewCommissions.desc") || "Open your commissions report to track earnings and performance.",
                        side: "top",
                        align: "start"
                    }
                },
                {
                    element: "#sidebar-home",
                    popover: {
                        title: t("onboarding.sellerHome.sidebar.title") || "Dashboard",
                        description: t("onboarding.sellerHome.sidebar.desc") || "Return here anytime to see your sales overview.",
                        side: "right",
                        align: "center"
                    }
                },
                {
                    element: "#profile-trigger",
                    popover: {
                        title: t("onboarding.profile.title") || "Your Profile",
                        description: t("onboarding.profile.desc") || "Access your settings, change language, or restart this tour anytime from here.",
                        side: "bottom",
                        align: "end"
                    }
                }
            ],
            projects: [
                {
                    element: "#projects-filter-section",
                    popover: {
                        title: t("onboarding.projectsTour.filter.title") || "Filters & Search",
                        description: t("onboarding.projectsTour.filter.desc") || "Find specific projects using advanced filters.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#add-project-btn",
                    popover: {
                        title: t("onboarding.projectsTour.addProject.title") || "Add Project",
                        description: t("onboarding.projectsTour.addProject.desc") || "Create new real estate projects easily.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#import-projects-btn",
                    popover: {
                        title: t("onboarding.projectsTour.import.title") || "Import Projects",
                        description: t("onboarding.projectsTour.import.desc") || "Bulk upload projects via CSV.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#first-project-card",
                    popover: {
                        title: t("onboarding.projectsTour.projectCard.title") || "Project Card",
                        description: t("onboarding.projectsTour.projectCard.desc") || "Each project card shows key information and available actions.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#project-view-lots-btn",
                    popover: {
                        title: t("onboarding.projectsTour.viewLots.title") || "View Lots",
                        description: t("onboarding.projectsTour.viewLots.desc") || "Click here to manage and view all lots within this project.",
                        side: "top",
                        align: "end"
                    }
                },
                {
                    element: "#project-edit-btn",
                    popover: {
                        title: t("onboarding.projectsTour.editProject.title") || "Edit Project",
                        description: t("onboarding.projectsTour.editProject.desc") || "Modify project details and settings.",
                        side: "top",
                        align: "start"
                    }
                },
                {
                    element: "#project-delete-btn",
                    popover: {
                        title: t("onboarding.projectsTour.deleteProject.title") || "Delete Project",
                        description: t("onboarding.projectsTour.deleteProject.desc") || "Remove this project permanently (requires confirmation).",
                        side: "top",
                        align: "start"
                    }
                }
            ],

            contracts: [
                {
                    element: "#contract-stats",
                    popover: {
                        title: t("onboarding.contractsTour.stats.title") || "Contract Stats",
                        description: t("onboarding.contractsTour.stats.desc") || "Quick overview of contract statuses.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#contracts-filter-section",
                    popover: {
                        title: t("onboarding.contractsTour.filter.title") || "Manage Contracts",
                        description: t("onboarding.contractsTour.filter.desc") || "Search and filter through your contracts.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#view-mode-toggles",
                    popover: {
                        title: t("onboarding.contractsTour.viewMode.title") || "View Mode",
                        description: t("onboarding.contractsTour.viewMode.desc") || "Switch between grid and list views.",
                        side: "left",
                        align: "start"
                    }
                },
                {
                    element: "#contract-schedule-btn",
                    popover: {
                        title: t("onboarding.contractsTour.schedule.title") || "Payment Schedule",
                        description: t("onboarding.contractsTour.schedule.desc") || "View and manage the complete payment schedule for this contract.",
                        side: "left",
                        align: "start"
                    }
                },
                {
                    element: "#contract-view-details-btn",
                    popover: {
                        title: t("onboarding.contractsTour.viewDetails.title") || "View Contract Details",
                        description: t("onboarding.contractsTour.viewDetails.desc") || "Click here to access complete contract information, payment schedules, and documents.",
                        side: "left",
                        align: "start"
                    }
                }
            ],

            users: [
                {
                    element: "#users-search-bar",
                    popover: {
                        title: t("onboarding.usersTour.search.title") || "Search Users",
                        description: t("onboarding.usersTour.search.desc") || "Search and filter users by name or role.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#add-user-btn",
                    popover: {
                        title: t("onboarding.usersTour.addUser.title") || "Add New User",
                        description: t("onboarding.usersTour.addUser.desc") || "Create new user accounts with specific roles and permissions.",
                        side: "left",
                        align: "start"
                    }
                },
                {
                    element: "#first-user-card",
                    popover: {
                        title: t("onboarding.usersTour.userCard.title") || "User Card",
                        description: t("onboarding.usersTour.userCard.desc") || "Each user card shows information and available actions.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#user-status-toggle",
                    popover: {
                        title: t("onboarding.usersTour.statusToggle.title") || "Activate/Deactivate User",
                        description: t("onboarding.usersTour.statusToggle.desc") || "Toggle user access to the system.",
                        side: "left",
                        align: "start"
                    }
                },
                {
                    element: "#user-edit-btn",
                    popover: {
                        title: t("onboarding.usersTour.editUser.title") || "Edit User",
                        description: t("onboarding.usersTour.editUser.desc") || "Modify user information and permissions.",
                        side: "top",
                        align: "start"
                    }
                },
                {
                    element: "#user-invite-btn",
                    popover: {
                        title: t("onboarding.usersTour.inviteUser.title") || "Resend Invitation",
                        description: t("onboarding.usersTour.inviteUser.desc") || "Resend confirmation email to the user.",
                        side: "top",
                        align: "start"
                    }
                }
            ],

            analytics: [
                {
                    element: "#analytics-header",
                    popover: {
                        title: t("onboarding.analyticsTour.header.title") || "Analytics Dashboard",
                        description: t("onboarding.analyticsTour.header.desc") || "Visualize key metrics and trends of your real estate business.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#analytics-filters",
                    popover: {
                        title: t("onboarding.analyticsTour.filters.title") || "Data Filters",
                        description: t("onboarding.analyticsTour.filters.desc") || "Filter analytics by project and date range for specific insights.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#analytics-export-dropdown",
                    popover: {
                        title: t("onboarding.analyticsTour.export.title") || "Export Reports",
                        description: t("onboarding.analyticsTour.export.desc") || "Download reports in different formats (CSV, Excel, PDF).",
                        side: "left",
                        align: "start"
                    }
                },
                {
                    element: "#analytics-stats",
                    popover: {
                        title: t("onboarding.analyticsTour.stats.title") || "Key Metrics",
                        description: t("onboarding.analyticsTour.stats.desc") || "Quick view of total revenue, active contracts, average payment, and occupancy rate.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#revenue-chart",
                    popover: {
                        title: t("onboarding.analyticsTour.revenueChart.title") || "Revenue Trend",
                        description: t("onboarding.analyticsTour.revenueChart.desc") || "Main chart showing real vs projected revenue. Use year controls to navigate.",
                        side: "top",
                        align: "start"
                    }
                }
            ],

            financing: [
                {
                    element: "#financing-hero",
                    popover: {
                        title: t("onboarding.financingTour.hero.title") || "Your Balance",
                        description: t("onboarding.financingTour.hero.desc") || "This is your current balance. From this page you can see your payment progress and manage your installments.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#financing-stats",
                    popover: {
                        title: t("onboarding.financingTour.stats.title") || "Payment Progress",
                        description: t("onboarding.financingTour.stats.desc") || "See how much you have paid vs total amount. The bar shows your overall progress.",
                        side: "top",
                        align: "start"
                    }
                },
                {
                    element: "#financing-next-payment",
                    popover: {
                        title: t("onboarding.financingTour.nextPayment.title") || "Next Payment",
                        description: t("onboarding.financingTour.nextPayment.desc") || "Your next upcoming installment: amount and due date. Plan ahead for this payment.",
                        side: "top",
                        align: "start"
                    }
                },
                {
                    element: "#financing-timeline",
                    popover: {
                        title: t("onboarding.financingTour.timeline.title") || "Payment History",
                        description: t("onboarding.financingTour.timeline.desc") || "All your installments in one place: overdue (red), upcoming (amber), and completed (green). Scroll to see more.",
                        side: "top",
                        align: "start"
                    }
                },
                {
                    element: "#financing-first-payment-card",
                    popover: {
                        title: t("onboarding.financingTour.uploadReceipt.title") || "Upload Receipt",
                        description: t("onboarding.financingTour.uploadReceipt.desc") || "For each pending payment you can upload a receipt here. Click the button, select your proof of payment, and confirm. Your balance will update once approved.",
                        side: "right",
                        align: "start"
                    }
                }
            ]
        };

        const steps = stepsConfig[tourKey] || [];

        // Filter out steps where element doesn't exist to prevent errors
        const validSteps = steps.filter(step => document.querySelector(step.element));

        if (validSteps.length === 0) return;

        const driverObj = driver({
            showProgress: true,
            animate: true,
            doneBtnText: t("common.close") || "Close",
            nextBtnText: t("common.next") || "Next",
            prevBtnText: t("common.previous") || "Previous",
            steps: validSteps,
            onDestroyed: () => {
                markTourCompleted(tourKey);
            }
        });

        driverObj.drive();
    }, [t, markTourCompleted]);

    const contextValue = useMemo(() => ({ startTour, isTourCompleted }), [startTour, isTourCompleted]);

    return (
        <OnboardingContext.Provider value={contextValue}>
            {children}
        </OnboardingContext.Provider>
    );
};
