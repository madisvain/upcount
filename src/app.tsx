import "src/styles/base.scss";

// Import devtools styles for development
if (import.meta.env.DEV) {
  import("jotai-devtools/styles.css");
}

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

// Lazy load DevTools for development only
const DevTools = lazy(() => 
  import.meta.env.DEV 
    ? import('jotai-devtools').then(module => ({ default: module.DevTools }))
    : Promise.resolve({ default: () => null })
);

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOrganizationChanging, setIsOrganizationChanging] = useState(false);
  
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

  // Watch for organization changes
  useEffect(() => {
    let isChanging = false;
    
    // If organizationId is null and we're not on the index page, redirect to index
    if (organizationId === null && location.pathname !== "/") {
      setIsOrganizationChanging(true);
      navigate("/");
      return;
    }
    
    // Only auto-set if organizationId is not null and not found in organizations
    if (organizationId !== null && !find(organizations, { id: organizationId })) {
      isChanging = true;
      setIsOrganizationChanging(true);
      const nextOrganization: any = first(organizations);
      setOrganizationId(organizations.length > 0 ? nextOrganization.id : null);
    }
    
    // Clear loading state after a short delay if we didn't change anything
    if (!isChanging && isOrganizationChanging) {
      setTimeout(() => setIsOrganizationChanging(false), 100);
    }
  }, [organizations, organizationId, setOrganizationId, navigate, location.pathname, isOrganizationChanging]);
  
  // Clear loading state when organizationId is stable
  useEffect(() => {
    if (isOrganizationChanging && organizationId !== null && find(organizations, { id: organizationId })) {
      setIsOrganizationChanging(false);
    }
  }, [organizationId, organizations, isOrganizationChanging]);

  return (
    <Suspense fallback={<Loading />}>
      {isOrganizationChanging ? (
        <Loading />
      ) : (
        <ConfigProvider
          theme={{
            token: {
              borderRadius: 2,
            },
          }}
        >
          <Suspense fallback={null}>
            <DevTools />
          </Suspense>
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
      )}
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
