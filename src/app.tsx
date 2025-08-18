import "src/styles/base.scss";

// Import devtools styles for development
if (import.meta.env.DEV && import.meta.env.VITE_JOTAI_DEVTOOLS_ENABLED === 'true') {
  import("jotai-devtools/styles.css");
}

// Initialize Sentry for error tracking
import { initSentry } from "src/utils/sentry";
initSentry();

import "dayjs/locale/en";
import "dayjs/locale/en-gb";
import "dayjs/locale/et";
import "dayjs/locale/de";
import "dayjs/locale/fi";
import "dayjs/locale/fr";
import "dayjs/locale/nl";
import "dayjs/locale/pt";
import "dayjs/locale/sv";
import "dayjs/locale/uk";

import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useLocation } from "react-router";
import { ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import enGB from "antd/locale/en_GB";
import etEE from "antd/locale/et_EE";
import deDE from "antd/locale/de_DE";
import fiFI from "antd/locale/fi_FI";
import frFR from "antd/locale/fr_FR";
import nlNL from "antd/locale/nl_NL";
import ptPT from "antd/locale/pt_PT";
import svSE from "antd/locale/sv_SE";
import ukUA from "antd/locale/uk_UA";
import { useAtomValue, useSetAtom } from "jotai";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

import { localeAtom } from "src/atoms/generic";
import { dynamicActivate } from "src/utils/lingui";

import { organizationIdAtom, setOrganizationsAtom } from "src/atoms/organization";
import BaseLayout from "src/layouts/base";
import Clients from "src/routes/clients";
import Projects from "src/routes/projects";
import Index from "src/routes/index";
import Invoices from "src/routes/invoices";
import InvoiceDetails from "src/routes/invoices/details.tsx";
import InvoicePreview from "src/routes/invoices/preview.tsx";
import SettingsInvoice from "src/routes/settings/invoice";
import SettingsOrganization from "src/routes/settings/organization";
import SettingsTaxRates from "src/routes/settings/tax-rates";
import SettingsBackup from "src/routes/settings/backup";
import SettingsAI from "src/routes/settings/ai";
import TimeTracking from "src/routes/time-tracking/index";
import TimeTrackingReports from "src/routes/time-tracking/reports";
import NewOrganization from "src/routes/organizations/new";

// Components
import Loading from "src/components/loading";
import TaxRateForm from "src/components/tax-rates/form.tsx";

dayjs.extend(localizedFormat);

// Lazy load DevTools for development
const DevTools = import.meta.env.DEV && import.meta.env.VITE_JOTAI_DEVTOOLS_ENABLED === 'true'
  ? lazy(() => import("jotai-devtools").then(module => ({ default: module.DevTools })))
  : () => null;

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load locale
  const locale = useAtomValue(localeAtom);
  
  // Organizations
  const organizationId = useAtomValue(organizationIdAtom);
  const setOrganizations = useSetAtom(setOrganizationsAtom);

  // Map locale to Ant Design locale
  const antdLocale = useMemo(() => {
    let baseLocale;
    switch (locale) {
      case "et":
        baseLocale = etEE;
        break;
      case "de":
        baseLocale = deDE;
        break;
      case "fi":
        baseLocale = fiFI;
        break;
      case "fr":
        baseLocale = frFR;
        break;
      case "nl":
        baseLocale = nlNL;
        break;
      case "pt":
        baseLocale = ptPT;
        break;
      case "sv":
        baseLocale = svSE;
        break;
      case "uk":
        baseLocale = ukUA;
        break;
      case "en-GB":
        baseLocale = enGB;
        break;
      case "en":
      default:
        baseLocale = enUS;
    }

    return baseLocale;
  }, [locale]);

  useEffect(() => {
    dynamicActivate(locale);
  }, [locale]);

  useEffect(() => {
    setOrganizations();
  }, [setOrganizations]);

  // Brief loading to prevent CSS flicker
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Redirect to index if no organization is selected and we're not on an allowed path
  useEffect(() => {
    const allowedPathsWithoutOrg = ["/", "/organizations/new"];
    const isAllowedPath = allowedPathsWithoutOrg.includes(location.pathname);
    
    if (organizationId === null && !isAllowedPath) {
      navigate("/");
    }
  }, [organizationId, navigate, location.pathname]);

  // Show loading spinner briefly to prevent CSS flicker
  if (isInitialLoading) {
    return <Loading />;
  }

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        token: {
          borderRadius: 2,
        },
      }}
    >
      {import.meta.env.DEV && import.meta.env.VITE_JOTAI_DEVTOOLS_ENABLED === 'true' && (
        <Suspense fallback={null}>
          <DevTools />
        </Suspense>
      )}
      <I18nProvider i18n={i18n}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/organizations/new" element={<NewOrganization />} />
          <Route path="/invoices" element={<BaseLayout />}>
            <Route index element={<Invoices />} />
            <Route path=":id" element={<InvoiceDetails />} />
            <Route path=":id/preview" element={<InvoicePreview />} />
            <Route path=":id/pdf" element={<InvoiceDetails />} />
          </Route>
          <Route path="/clients" element={<BaseLayout />}>
            <Route index element={<Clients />} />
          </Route>
          <Route path="/projects" element={<BaseLayout />}>
            <Route index element={<Projects />} />
          </Route>
          <Route path="/time-tracking" element={<BaseLayout />}>
            <Route path="" element={<TimeTracking />} />
            <Route path="reports" element={<TimeTrackingReports />} />
          </Route>
          <Route path="/settings" element={<BaseLayout />}>
            <Route index element={<Navigate to="/invoices/organization" />} />
            <Route path="invoice" element={<SettingsInvoice />} />
            <Route path="organization" element={<SettingsOrganization />} />
            <Route path="tax-rates" element={<SettingsTaxRates />}>
              <Route path="new" element={<TaxRateForm />} />
              <Route path=":id" element={<TaxRateForm />} />
            </Route>
            <Route path="backup" element={<SettingsBackup />} />
            <Route path="ai" element={<SettingsAI />} />
          </Route>
        </Routes>
      </I18nProvider>
    </ConfigProvider>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
