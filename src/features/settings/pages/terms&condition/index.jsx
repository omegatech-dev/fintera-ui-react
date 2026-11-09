
import { useLocale } from "../../../../contexts/LocaleContext";
import { useState, useEffect } from 'react';
import en from "../../../../locales/en.json";
import es from "../../../../locales/es.json";

function TermsAndCondition() {
  const { t, locale } = useLocale();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Set current date for "Last Updated"
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCurrentDate(formattedDate);
  }, []);

  // Helper function to get array values from translations
  const getTranslationArray = (key) => {
    const keys = key.split('.');
    const translations = locale === 'es' ? es : en;
    const value = keys.reduce((current, k) => current?.[k], translations);
    return Array.isArray(value) ? value : [];
  };

  return (
    <div id="tab7" className="tab-pane active">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-bgray-900 dark:text-white mb-4">
            {t('termsAndConditions.title')}
          </h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('termsAndConditions.sections.welcome')}
          </p>
        </div>

        {/* Last Updated */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {t('termsAndConditions.lastUpdated')}: {currentDate}
              </h3>
            </div>
          </div>
        </div>

        {/* Terms Content */}
        <div className="space-y-8">
          {/* Section 1: Acceptance */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start mb-4">
              <div className="shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 dark:text-blue-300 font-bold text-lg">1</span>
              </div>
              <h2 className="text-2xl font-bold text-bgray-800 dark:text-white">
                {t('termsAndConditions.sections.acceptanceTitle')}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              {t('termsAndConditions.sections.acceptance')}
            </p>
          </section>

          {/* Section 2: Description of Services */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start mb-4">
              <div className="shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4">
                <span className="text-green-600 dark:text-green-300 font-bold text-lg">2</span>
              </div>
              <h2 className="text-2xl font-bold text-bgray-800 dark:text-white">
                {t('termsAndConditions.sections.descriptionTitle')}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              {t('termsAndConditions.sections.description')}
            </p>
          </section>

          {/* Section 3: Account Registration */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start mb-4">
              <div className="shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-4">
                <span className="text-purple-600 dark:text-purple-300 font-bold text-lg">3</span>
              </div>
              <h2 className="text-2xl font-bold text-bgray-800 dark:text-white">
                {t('termsAndConditions.sections.accountRegistrationTitle')}
              </h2>
            </div>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              {getTranslationArray('termsAndConditions.sections.accountRegistration.points').map((point, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 4: Use of Platform */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start mb-4">
              <div className="shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-4">
                <span className="text-orange-600 dark:text-orange-300 font-bold text-lg">4</span>
              </div>
              <h2 className="text-2xl font-bold text-bgray-800 dark:text-white">
                {t('termsAndConditions.sections.useOfPlatformTitle')}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              {t('termsAndConditions.sections.useOfPlatform')}
            </p>
          </section>

          {/* Section 5: Fees and Payments */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start mb-4">
              <div className="shrink-0 w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-4">
                <span className="text-yellow-600 dark:text-yellow-300 font-bold text-lg">5</span>
              </div>
              <h2 className="text-2xl font-bold text-bgray-800 dark:text-white">
                {t('termsAndConditions.sections.feesAndPaymentsTitle')}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              {t('termsAndConditions.sections.feesAndPayments')}
            </p>
          </section>

          {/* Section 6: Notifications and Communications */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start mb-4">
              <div className="shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mr-4">
                <span className="text-indigo-600 dark:text-indigo-300 font-bold text-lg">6</span>
              </div>
              <h2 className="text-2xl font-bold text-bgray-800 dark:text-white">
                {t('termsAndConditions.sections.notificationsTitle')}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4">
              {t('termsAndConditions.sections.notifications.intro')}
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              {getTranslationArray('termsAndConditions.sections.notifications.points').map((point, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 7: Privacy Policy */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start mb-4">
              <div className="shrink-0 w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mr-4">
                <span className="text-pink-600 dark:text-pink-300 font-bold text-lg">7</span>
              </div>
              <h2 className="text-2xl font-bold text-bgray-800 dark:text-white">
                {t('termsAndConditions.sections.privacyPolicyTitle')}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              {t('termsAndConditions.sections.privacyPolicy')}
            </p>
          </section>

          {/* Section 8: Limitation of Liability */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start mb-4">
              <div className="shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-4">
                <span className="text-red-600 dark:text-red-300 font-bold text-lg">8</span>
              </div>
              <h2 className="text-2xl font-bold text-bgray-800 dark:text-white">
                {t('termsAndConditions.sections.limitationOfLiabilityTitle')}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              {t('termsAndConditions.sections.limitationOfLiability')}
            </p>
          </section>

          {/* Section 9: Account Suspension and Termination */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start mb-4">
              <div className="shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-4">
                <span className="text-gray-600 dark:text-gray-300 font-bold text-lg">9</span>
              </div>
              <h2 className="text-2xl font-bold text-bgray-800 dark:text-white">
                {t('termsAndConditions.sections.accountSuspensionTitle')}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              {t('termsAndConditions.sections.accountSuspension')}
            </p>
          </section>

          {/* Section 10: Amendments */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start mb-4">
              <div className="shrink-0 w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mr-4">
                <span className="text-teal-600 dark:text-teal-300 font-bold text-lg">10</span>
              </div>
              <h2 className="text-2xl font-bold text-bgray-800 dark:text-white">
                {t('termsAndConditions.sections.amendmentsTitle')}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              {t('termsAndConditions.sections.amendments')}
            </p>
          </section>

          {/* Section 11: Contact Information */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start mb-4">
              <div className="shrink-0 w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center mr-4">
                <span className="text-cyan-600 dark:text-cyan-300 font-bold text-lg">11</span>
              </div>
              <h2 className="text-2xl font-bold text-bgray-800 dark:text-white">
                {t('termsAndConditions.sections.contactInformationTitle')}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4">
              {t('termsAndConditions.sections.contactInformation.content')}
            </p>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p className="flex items-center">
                <svg className="w-5 h-5 text-cyan-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t('termsAndConditions.sections.contactInformation.email')}
              </p>
              <p className="flex items-center">
                <svg className="w-5 h-5 text-cyan-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {t('termsAndConditions.sections.contactInformation.phone')}
              </p>
              <p className="flex items-center">
                <svg className="w-5 h-5 text-cyan-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t('termsAndConditions.sections.contactInformation.address')}
              </p>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('termsAndConditions.footerNote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsAndCondition;
