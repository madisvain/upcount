import "src/styles/base.scss";

// Import devtools styles for development
if (import.meta.env.DEV) {
  import("jotai-devtools/styles.css");
}

// Initialize Sentry for error tracking
import { initSentry } from "src/utils/sentry";
initSentry();

import "dayjs/locale/en";
import "dayjs/locale/et";

import { useEffect, Suspense, lazy, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useLocation } from "react-router";
import { ConfigProvider } from "antd";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import dayjs from "dayjs";
import first from "lodash/first";
import find from "lodash/find";
import localizedFormat from "dayjs/plugin/localizedFormat";

import { localeAtom } from "src/atoms.tsx";
import { dynamicActivate } from "src/utils/lingui";

import { organizationIdAtom, organizationsAtom, setOrganizationsAtom } from "src/atoms";
import BaseLayout from "src/layouts/base";
import Clients from "src/routes/clients";
import Index from "src/routes/index";
import Invoices from "src/routes/invoices";
import InvoiceDetails from "src/routes/invoices/details.tsx";
import InvoicePreview from "src/routes/invoices/preview.tsx";
import SettingsInvoice from "src/routes/settings/invoice";
import SettingsOrganization from "src/routes/settings/organization";
import SettingsTaxRates from "src/routes/settings/tax-rates";
import SettingsBackup from "src/routes/settings/backup";
import TimeTracking from "src/routes/time-tracking";

// Components
import Loading from "src/components/loading";
import TaxRateForm from "src/components/tax-rates/form.tsx";

dayjs.extend(localizedFormat);

// Import DevTools directly for development
import { DevTools } from "jotai-devtools";

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load locale
  const locale = useAtomValue(localeAtom);

  useEffect(() => {
    dynamicActivate(locale);
  }, [locale]);

  // Organizations
  const [organizationId, setOrganizationId] = useAtom(organizationIdAtom);
  const organizations = useAtomValue(organizationsAtom);
  const setOrganizations = useSetAtom(setOrganizationsAtom);

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

  // Watch for organization changes
  useEffect(() => {
    // If organizationId is null and we're not on the index page, redirect to index
    if (organizationId === null && location.pathname !== "/") {
      navigate("/");
      return;
    }

    // Only auto-set if organizationId is not null and not found in organizations
    if (organizationId !== null && organizations.length > 0 && !find(organizations, { id: organizationId })) {
      const nextOrganization: any = first(organizations);
      setOrganizationId(nextOrganization.id);
    }
  }, [organizations, organizationId, setOrganizationId, navigate, location.pathname]);

  // Show loading spinner briefly to prevent CSS flicker
  if (isInitialLoading) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 2,
          },
        }}
      >
        {import.meta.env.DEV && <DevTools />}
        <I18nProvider i18n={i18n}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/invoices" element={<BaseLayout />}>
              <Route index element={<Invoices />} />
              <Route path=":id" element={<InvoiceDetails />} />
              <Route path=":id/preview" element={<InvoicePreview />} />
              <Route path=":id/pdf" element={<InvoiceDetails />} />
            </Route>
            <Route path="/clients" element={<BaseLayout />}>
              <Route index element={<Clients />} />
            </Route>
            <Route path="/time-tracking" element={<BaseLayout />}>
              <Route path="" element={<TimeTracking />} />
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
            </Route>
          </Routes>
        </I18nProvider>
      </ConfigProvider>
    </Suspense>
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
