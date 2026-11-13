import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';

// Helper function to get random welcome message
const getRandomWelcomeMessage = (t) => {
  const messages = [
    t('header.welcomeMessages.1'),
    t('header.welcomeMessages.2'),
    t('header.welcomeMessages.3'),
    t('header.welcomeMessages.4'),
    t('header.welcomeMessages.5'),
  ];
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

export const usePageTitle = () => {
  const location = useLocation();
  const { t } = useLocale();

  const { title, subtitle } = useMemo(() => {
    const path = location.pathname;

    // Route mapping
    const routes = {
      '/': {
        title: t('header.pageTitle.dashboard'),
        subtitle: getRandomWelcomeMessage(t)
      },
      '/contracts': {
        title: t('header.pageTitle.contracts'),
        subtitle: t('contracts.manageContracts')
      },
      '/transaction': {
        title: t('header.pageTitle.transaction'),
        subtitle: t('payments.managePayments')
      },
      '/analytics': {
        title: t('analytics.title'),
        subtitle: t('analytics.subtitle')
      },
      '/payments': {
        title: t('payments.title'),
        subtitle: t('payments.subtitle')
      },
      '/projects': {
        title: t('header.pageTitle.projects'),
        subtitle: t('projects.manageProjects')
      },
      '/projects/create': {
        title: t('header.pageTitle.createProject'),
        subtitle: t('projects.fillProjectInfo')
      },
      '/projects/lots': {
        title: t('header.pageTitle.lotsList'),
        subtitle: t('lots.manageLots')
      },
      '/projects/reserve': {
        title: t('header.pageTitle.reserve'),
        subtitle: t('reservations.createReservation')
      },
      '/users': {
        title: t('header.pageTitle.users'),
        subtitle: t('users.manageSystemUsers')
      },
      '/users/create': {
        title: t('header.pageTitle.createUser'),
        subtitle: t('users.fillUserInfo')
      },
      '/audits': {
        title: t('header.pageTitle.audits'),
        subtitle: t('audits.viewSystemActivity')
      },
      '/settings': {
        title: t('settings.admin.title'),
        subtitle: t('settings.admin.subtitle')
      },
      '/settings/general': {
        title: t('settings.admin.title'),
        subtitle: t('settings.admin.generalDescription')
      },
      '/settings/branding': {
        title: t('settings.admin.title'),
        subtitle: t('settings.admin.brandIdentityDescription')
      },
      '/balance': {
        title: t('header.pageTitle.balance'),
        subtitle: t('payments.viewPaymentSummary')
      },
      '/balance/summary': {
        title: t('header.pageTitle.summary'),
        subtitle: t('payments.detailedPaymentInfo')
      },
    };

    // Check for exact match
    if (routes[path]) {
      return routes[path];
    }

    if (path.startsWith('/docs')) {
      return {
        title: t('docs.title'),
        subtitle: t('docs.subtitle')
      };
    }

    // Project sub-routes (lots, reserve, payment instructions).
    if (/^\/projects\/[^/]+\/lots\/[^/]+\/contracts\/create$/.test(path)) {
      return {
        title: t('header.pageTitle.reserve'),
        subtitle: t('reservations.createReservation')
      };
    }

    if (/^\/projects\/[^/]+\/lots$/.test(path)) {
      return {
        title: t('header.pageTitle.lotsList'),
        subtitle: t('lots.manageLots')
      };
    }

    if (/^\/projects\/[^/]+\/lots\/create$/.test(path)) {
      return {
        title: t('header.pageTitle.createLot'),
        subtitle: t('lots.manageLots')
      };
    }

    if (/^\/projects\/[^/]+\/payment-instructions$/.test(path)) {
      return {
        title: t('paymentInstructions.title'),
        subtitle: t('paymentInstructions.description')
      };
    }

    if (/^\/contracts\/[^/]+$/.test(path)) {
      return {
        title: t('header.pageTitle.contracts'),
        subtitle: t('contracts.manageContracts')
      };
    }

    // Check for dynamic routes (settings, edit, etc.)
    if (path.startsWith('/settings/user/')) {
      const segments = path.split('/');
      const lastSegment = segments[segments.length - 1];

      if (lastSegment === 'security') {
        return {
          title: t('header.pageTitle.security'),
          subtitle: t('settings.securityDescription')
        };
      } else if (lastSegment === 'terms&conditions') {
        return {
          title: t('header.pageTitle.terms'),
          subtitle: t('settings.termsDescription')
        };
      } else {
        return {
          title: t('header.pageTitle.personalInfo'),
          subtitle: t('settings.personalDescription')
        };
      }
    }

    if (path.includes('/projects/') && path.includes('/edit')) {
      return {
        title: t('header.pageTitle.editProject'),
        subtitle: t('projects.updateProjectInfo')
      };
    }

    if (path.includes('/lots/') && path.includes('/edit')) {
      return {
        title: t('header.pageTitle.editLot'),
        subtitle: t('lots.updateLotInfo')
      };
    }

    if (path.includes('/payment/') && path.includes('/upload')) {
      return {
        title: t('header.pageTitle.upload'),
        subtitle: t('payments.uploadPaymentReceipt')
      };
    }

    // Default fallback
    return {
      title: t('header.pageTitle.dashboard'),
      subtitle: getRandomWelcomeMessage(t)
    };
  }, [location.pathname, t]);

  return { title, subtitle };
};
